import type { NextRequest } from 'next/server';
import { logSettingsService } from '@/lib/api/handlers/log-settings.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { updateLogSettingsSchema } from '@/lib/validations/log-settings.schema';

async function handleGet() {
  try {
    const settings = await logSettingsService.get();
    return successResponse(settings);
  } catch {
    return serverErrorResponse('Failed to fetch log settings');
  }
}

async function handlePut(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateLogSettingsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const settings = await logSettingsService.update(validation.data);
    return successResponse(settings);
  } catch {
    return serverErrorResponse('Failed to update log settings');
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
