import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSlotsService } from '@/lib/api/handlers/booking-slots.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { slotsQuerySchema, createBookingSlotSchema } from '@/lib/validations/booking-slots.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    };

    const validation = slotsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await bookingSlotsService.getSlotsByDateRange(validation.data);
    return successResponse(result.slots);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createBookingSlotSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const slot = await bookingSlotsService.createSlot(validation.data);
    return successResponse(slot, 'Booking slot created successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return validationErrorResponse({ _errors: [error.message] });
    }
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
