import type { NextRequest } from 'next/server';
import { notificationInboxService } from '@/lib/api/handlers/notification-inbox.service';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { notFoundResponse, serverErrorResponse, successResponse } from '@/lib/api/responses';

type RouteContext = { readonly params: Promise<{ readonly id: string }> };

async function handlePatch(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const notification = await notificationInboxService.markRead(id);
    if (!notification) {
      return notFoundResponse('Notification');
    }
    return successResponse(notification, 'Notification marked as read');
  } catch {
    return serverErrorResponse('Failed to mark notification as read');
  }
}

async function handleDelete(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const notification = await notificationInboxService.remove(id);
    if (!notification) {
      return notFoundResponse('Notification');
    }
    return successResponse(notification, 'Notification deleted');
  } catch {
    return serverErrorResponse('Failed to delete notification');
  }
}

export const PATCH = withAdminAuthContext(handlePatch);
export const DELETE = withAdminAuthContext(handleDelete);
