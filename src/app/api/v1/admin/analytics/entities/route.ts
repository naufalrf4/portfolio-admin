import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') || '';
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!entityType) {
      return serverErrorResponse('entityType is required');
    }

    const entityStats = await analyticsService.getEntityStats(entityType, days);
    return successResponse(entityStats);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
