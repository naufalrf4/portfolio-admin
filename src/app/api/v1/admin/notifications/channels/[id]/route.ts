import type { NextRequest } from 'next/server';
import { notificationChannelsService } from '@/lib/api/handlers/notification-channels.service';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import {
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { updateChannelSchema } from '@/lib/validations/notifications.schema';

type RouteContext = { readonly params: Promise<{ readonly id: string }> };

async function handlePut(req: NextRequest, context: RouteContext) {
  try {
    const validation = updateChannelSchema.safeParse(await req.json());
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const { id } = await context.params;
    const channel = await notificationChannelsService.update(id, validation.data);
    if (!channel) {
      return notFoundResponse('Channel');
    }
    return successResponse(channel, 'Notification channel updated');
  } catch {
    return serverErrorResponse('Failed to update notification channel');
  }
}

async function handleDelete(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await notificationChannelsService.findById(id);
    if (!existing) {
      return notFoundResponse('Channel');
    }

    const result = await notificationChannelsService.remove(id);
    if (!result.ok) {
      return validationErrorResponse({ channelId: { _errors: [result.message] } });
    }
    return successResponse(result.channel, 'Notification channel deleted');
  } catch {
    return serverErrorResponse('Failed to delete notification channel');
  }
}

export const PUT = withAdminAuthContext(handlePut);
export const DELETE = withAdminAuthContext(handleDelete);
