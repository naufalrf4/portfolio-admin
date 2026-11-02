import { NextRequest } from 'next/server';
import { serverErrorResponse, successResponse } from '@/lib/api/responses';
import { logRetentionService } from '@/lib/services/logRetention.service';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await logRetentionService.cleanup();
    return successResponse({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch {
    return serverErrorResponse('Failed to cleanup logs');
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
