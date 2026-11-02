import type { NextRequest } from 'next/server';
import { notificationChannelsService } from '@/lib/api/handlers/notification-channels.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { createChannelSchema } from '@/lib/validations/notifications.schema';

async function handleGet(_req: NextRequest) {
  try {
    return successResponse(await notificationChannelsService.list());
  } catch {
    return serverErrorResponse('Failed to fetch notification channels');
  }
}

async function handlePost(req: NextRequest) {
  try {
    const validation = createChannelSchema.safeParse(await req.json());
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    return successResponse(
      await notificationChannelsService.create(validation.data),
      'Notification channel created'
    );
  } catch {
    return serverErrorResponse('Failed to create notification channel');
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
