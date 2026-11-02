import type { NextRequest } from 'next/server';
import { notificationOutboxService } from '@/lib/api/handlers/notification-outbox.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { outboxQuerySchema } from '@/lib/validations/notifications.schema';

async function handleGet(req: NextRequest) {
  try {
    const validation = outboxQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }
    return successResponse(await notificationOutboxService.list(validation.data));
  } catch {
    return serverErrorResponse('Failed to fetch notification outbox');
  }
}

export const GET = withAdminAuth(handleGet);
