import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingsService } from '@/lib/api/handlers/bookings.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateBookingStatusSchema } from '@/lib/validations/booking.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const booking = await bookingsService.getById(id);

      if (!booking) {
        return notFoundResponse('Booking');
      }

      return successResponse(booking);
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const validation = updateBookingStatusSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await bookingsService.getById(id);
      if (!exists) {
        return notFoundResponse('Booking');
      }

      const booking = await bookingsService.updateStatus(id, validation.data);
      return successResponse(booking, 'Booking updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await bookingsService.getById(id);
      if (!exists) {
        return notFoundResponse('Booking');
      }

      await bookingsService.delete(id);
      return successResponse(null, 'Booking deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
