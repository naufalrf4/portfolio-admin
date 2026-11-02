import type { NextRequest } from 'next/server';
import { notificationInboxService } from '@/lib/api/handlers/notification-inbox.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { inboxQuerySchema } from '@/lib/validations/notifications.schema';

async function handleGet(req: NextRequest) {
  try {
    const validation = inboxQuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }
    return successResponse(await notificationInboxService.list(validation.data));
  } catch {
    return serverErrorResponse('Failed to fetch notifications');
  }
}

async function handleDelete() {
  try {
    const deletedCount = await notificationInboxService.clearRead();
    return successResponse(
      { deletedCount },
      `Cleared ${deletedCount} read notification${deletedCount === 1 ? '' : 's'}`
    );
  } catch {
    return serverErrorResponse('Failed to clear notifications');
  }
}

export const GET = withAdminAuth(handleGet);
export const DELETE = withAdminAuth(handleDelete);
