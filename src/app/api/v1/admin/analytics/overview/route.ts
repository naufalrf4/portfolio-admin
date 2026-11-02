import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const overview = await analyticsService.getOverview(days);
    return successResponse(overview);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
