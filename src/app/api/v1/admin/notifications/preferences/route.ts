import type { NextRequest } from 'next/server';
import { notificationPreferenceService } from '@/lib/api/handlers/notification-preferences.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { savePreferenceSchema } from '@/lib/validations/notifications.schema';

async function handleGet() {
  try {
    return successResponse(await notificationPreferenceService.matrix());
  } catch {
    return serverErrorResponse('Failed to fetch notification preferences');
  }
}

async function handlePut(req: NextRequest) {
  try {
    const validation = savePreferenceSchema.safeParse(await req.json());
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    await notificationPreferenceService.save(validation.data);
    return successResponse(validation.data, 'Notification preference saved');
  } catch {
    return serverErrorResponse('Failed to save notification preference');
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
