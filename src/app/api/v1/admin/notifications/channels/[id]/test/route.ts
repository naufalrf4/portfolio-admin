import type { NextRequest } from 'next/server';
import { notificationChannelsService } from '@/lib/api/handlers/notification-channels.service';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import {
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api/responses';
import { sendMessage } from '@/lib/services/telegramService';

type RouteContext = { readonly params: Promise<{ readonly id: string }> };

async function handlePost(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const channel = await notificationChannelsService.findById(id);
    if (!channel) {
      return notFoundResponse('Channel');
    }

    const result = await sendMessage({
      chatId: channel.chatId,
      messageThreadId: channel.messageThreadId,
      text: 'Notification channel test from NaufalRF Admin.',
    });
    if (result.ok) {
      return successResponse(result);
    }

    const responseStatus = result.status >= 400 && result.status <= 599 ? result.status : 500;
    return errorResponse(result.description, responseStatus, 'TELEGRAM_ERROR', result);
  } catch {
    return serverErrorResponse('Failed to send notification test');
  }
}

export const POST = withAdminAuthContext(handlePost);
