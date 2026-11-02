import { NextRequest } from 'next/server';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import { chatLogsService } from '@/lib/api/handlers/chat-logs.service';
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api/responses';
import { createChatLogSchema } from '@/lib/validations/chat-log.schema';

async function handleGet(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return errorResponse('sessionId query parameter is required', 400, 'SESSION_ID_REQUIRED');
    }

    const chatLog = await chatLogsService.getBySessionId(sessionId);
    return successResponse(chatLog);
  } catch {
    return serverErrorResponse('Failed to fetch chat log');
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createChatLogSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const chatLog = await chatLogsService.upsert(validation.data);
    return successResponse(chatLog);
  } catch {
    return serverErrorResponse('Failed to save chat log');
  }
}

export const GET = withServiceAuth(handleGet);
export const POST = withServiceAuth(handlePost);
