import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse, validationErrorResponse, errorResponse } from '@/lib/api/responses';
import { createAnalyticsEventSchema } from '@/lib/validations/analytics.schema';

async function handlePost(req: Request) {
  try {
    const body = await req.json();
    const validation = createAnalyticsEventSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const event = await analyticsService.trackEvent(validation.data);
    return successResponse(event, 'Event tracked successfully');
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400);
    }
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
