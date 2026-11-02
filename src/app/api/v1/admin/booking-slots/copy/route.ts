import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSlotsService } from '@/lib/api/handlers/booking-slots.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { copyFromWeekSchema } from '@/lib/validations/booking-slots.schema';

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = copyFromWeekSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await bookingSlotsService.copyFromWeek(validation.data);
    return successResponse(
      result,
      `Copied ${result.created} slots from source week, skipped ${result.skipped} duplicates`
    );
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
