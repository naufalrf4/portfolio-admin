import type { NextRequest } from 'next/server';
import { pushSubscriptionService } from '@/lib/api/handlers/push-subscriptions.service';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { notFoundResponse, serverErrorResponse, successResponse } from '@/lib/api/responses';

type RouteContext = { readonly params: Promise<{ readonly id: string }> };

async function handleDelete(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const removed = await pushSubscriptionService.removeById(id);
    if (!removed) {
      return notFoundResponse('Push subscription');
    }
    return successResponse(removed, 'Device removed');
  } catch {
    return serverErrorResponse('Failed to remove push subscription');
  }
}

export const DELETE = withAdminAuthContext(handleDelete);
