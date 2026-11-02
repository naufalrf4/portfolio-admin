import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSettingsService } from '@/lib/api/handlers/booking-settings.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { updateBookingSettingsSchema } from '@/lib/validations/booking-settings.schema';

async function handleGet() {
  try {
    const settings = await bookingSettingsService.get();
    return successResponse(settings);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePut(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateBookingSettingsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const settings = await bookingSettingsService.update(validation.data);
    return successResponse(settings, 'Booking settings updated successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
