import { NextRequest } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { chatLogsService } from '@/lib/api/handlers/chat-logs.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleGet(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const log = await chatLogsService.getById(id);

    if (!log) {
      return notFoundResponse('Chat log');
    }

    return successResponse(log);
  } catch {
    return serverErrorResponse('Failed to fetch chat log');
  }
}

async function handleDelete(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await chatLogsService.getById(id);

    if (!existing) {
      return notFoundResponse('Chat log');
    }

    await chatLogsService.delete(id);
    return successResponse({ success: true }, 'Chat log deleted');
  } catch {
    return serverErrorResponse('Failed to delete chat log');
  }
}

export const GET = withAdminAuthContext(handleGet);
export const DELETE = withAdminAuthContext(handleDelete);
