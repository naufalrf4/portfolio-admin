import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { createAnalyticsEventSchema } from '@/lib/validations/analytics.schema';

async function handlePost(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createAnalyticsEventSchema.parse(body);

    const event = await analyticsService.trackEvent(validatedData);
    return successResponse(event, 'Event tracked successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
