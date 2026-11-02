import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingsService } from '@/lib/api/handlers/bookings.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { calendarQuerySchema } from '@/lib/validations/booking.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = calendarQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await bookingsService.getCalendarView(validation.data);
    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
