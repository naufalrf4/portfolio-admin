import { notificationInboxService } from '@/lib/api/handlers/notification-inbox.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { serverErrorResponse, successResponse } from '@/lib/api/responses';

async function handlePost() {
  try {
    const updatedCount = await notificationInboxService.markAllRead();
    return successResponse(
      { updatedCount },
      `Marked ${updatedCount} notification${updatedCount === 1 ? '' : 's'} as read`
    );
  } catch {
    return serverErrorResponse('Failed to mark notifications as read');
  }
}

export const POST = withAdminAuth(handlePost);
