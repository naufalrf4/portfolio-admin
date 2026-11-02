import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { contactSettingsService } from '@/lib/api/handlers/contact-settings.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { updateContactSettingsSchema } from '@/lib/validations/contact-settings.schema';

async function handleGet() {
  try {
    const settings = await contactSettingsService.get();
    return successResponse(settings);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePut(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateContactSettingsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const settings = await contactSettingsService.update(validation.data);
    return successResponse(settings, 'Contact settings updated successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
