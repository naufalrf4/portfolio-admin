import type { NextRequest } from 'next/server';
import { notificationOutboxService } from '@/lib/api/handlers/notification-outbox.service';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import {
  notFoundResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';

type RouteContext = { readonly params: Promise<{ readonly id: string }> };

async function handlePost(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await notificationOutboxService.retry(id);
    if (!result.ok) {
      if (result.code === 'not_found') {
        return notFoundResponse('Outbox delivery');
      }
      return validationErrorResponse({ status: { _errors: [result.message] } });
    }
    return successResponse(result.delivery, 'Notification queued for retry');
  } catch {
    return serverErrorResponse('Failed to retry notification');
  }
}

export const POST = withAdminAuthContext(handlePost);
