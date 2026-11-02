import { NextRequest } from 'next/server';
import { serverErrorResponse, successResponse } from '@/lib/api/responses';
import { dispatchPendingNotifications } from '@/lib/services/notificationDispatch.service';
import { sendMessage } from '@/lib/services/telegramService';
import { sendPush } from '@/lib/services/webPushService';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await dispatchPendingNotifications({
      send: sendMessage,
      sendPush,
      sleep: async (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
    });
    return successResponse({ success: true, ...result, timestamp: new Date().toISOString() });
  } catch {
    return serverErrorResponse('Failed to dispatch notifications');
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
