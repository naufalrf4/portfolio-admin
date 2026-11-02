import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSlotsService } from '@/lib/api/handlers/booking-slots.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateBookingSlotSchema } from '@/lib/validations/booking-slots.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const slot = await bookingSlotsService.getSlotById(id);

      if (!slot) {
        return notFoundResponse('Booking slot');
      }

      return successResponse(slot);
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
      const validation = updateBookingSlotSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await bookingSlotsService.getSlotById(id);
      if (!exists) {
        return notFoundResponse('Booking slot');
      }

      const slot = await bookingSlotsService.updateSlot(id, validation.data);
      return successResponse(slot, 'Booking slot updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('Cannot')) {
          return validationErrorResponse({ _errors: [error.message] });
        }
      }
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await bookingSlotsService.getSlotById(id);
      if (!exists) {
        return notFoundResponse('Booking slot');
      }

      await bookingSlotsService.deleteSlot(id);
      return successResponse(null, 'Booking slot deleted successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot')) {
        return validationErrorResponse({ _errors: [error.message] });
      }
      return serverErrorResponse();
    }
  })(req);
}
