import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingsService } from '@/lib/api/handlers/bookings.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { bookingQuerySchema, createBookingSchema } from '@/lib/validations/booking.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = bookingQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await bookingsService.getAll(validation.data);
    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const booking = await bookingsService.create(validation.data);
    return successResponse(booking, 'Booking created successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Booking date must be in the future') {
      return validationErrorResponse({ date: error.message });
    }
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
