import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { logQueryService } from '@/lib/services/logQuery.service';
import { logQuerySchema } from '@/lib/validations/log-query.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = logQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const [{ logs, nextCursor }, counts] = await Promise.all([
      logQueryService.query(validation.data),
      logQueryService.countsByLevel(),
    ]);
    return successResponse({ logs, nextCursor, counts });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return validationErrorResponse({ cursor: { _errors: ['Invalid cursor'] } });
    }
    return serverErrorResponse('Failed to fetch logs');
  }
}

export const GET = withAdminAuth(handleGet);
