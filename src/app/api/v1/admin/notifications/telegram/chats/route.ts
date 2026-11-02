import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { errorResponse, serverErrorResponse, successResponse } from '@/lib/api/responses';
import { listAvailableChats } from '@/lib/services/telegramService';

async function handleGet(_req: NextRequest) {
  try {
    const result = await listAvailableChats();
    if (result.ok) {
      return successResponse(result.chats);
    }

    const responseStatus = result.status >= 400 && result.status <= 599 ? result.status : 500;
    return errorResponse(result.description, responseStatus, 'TELEGRAM_ERROR');
  } catch {
    return serverErrorResponse('Failed to list Telegram chats');
  }
}

export const GET = withAdminAuth(handleGet);
