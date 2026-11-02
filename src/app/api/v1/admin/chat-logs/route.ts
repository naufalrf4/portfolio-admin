import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { chatLogsService } from '@/lib/api/handlers/chat-logs.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { chatLogQuerySchema } from '@/lib/validations/chat-log.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = chatLogQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await chatLogsService.getAll(validation.data);
    return successResponse(result);
  } catch {
    return serverErrorResponse('Failed to fetch chat logs');
  }
}

export const GET = withAdminAuth(handleGet);
