import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawRange = searchParams.get('range');
    const range = rawRange === '7d' || rawRange === '90d' ? rawRange : '30d';
    const dashboard = await analyticsService.getDashboard(range);
    return successResponse(dashboard);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
