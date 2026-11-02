import { NextRequest } from 'next/server';
import { chatLogsService } from '@/lib/api/handlers/chat-logs.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const deletedCount = await chatLogsService.deleteExpired(7);

    return successResponse(
      {
        success: true,
        deletedCount,
        timestamp: new Date().toISOString(),
      },
      `Cleaned up ${deletedCount} expired chat logs`
    );
  } catch {
    return serverErrorResponse('Failed to cleanup chat logs');
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
