import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSlotsService } from '@/lib/api/handlers/booking-slots.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { bulkCreateSlotsSchema } from '@/lib/validations/booking-slots.schema';

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bulkCreateSlotsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await bookingSlotsService.createBulkSlots(validation.data);
    return successResponse(
      result,
      `Created ${result.created} slots, skipped ${result.skipped} duplicates`
    );
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
