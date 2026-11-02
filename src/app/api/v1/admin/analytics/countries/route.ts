import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const countryStats = await analyticsService.getCountryStats(days);
    return successResponse(countryStats);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
