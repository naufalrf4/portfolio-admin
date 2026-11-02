import type { NextRequest } from 'next/server';
import { pushSubscriptionService } from '@/lib/api/handlers/push-subscriptions.service';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import {
  pushSubscribeSchema,
  pushUnsubscribeSchema,
} from '@/lib/validations/notifications.schema';

async function handleGet() {
  try {
    return successResponse({
      publicKey: pushSubscriptionService.getPublicKey(),
      subscriptions: await pushSubscriptionService.list(),
    });
  } catch {
    return serverErrorResponse('Failed to fetch push subscriptions');
  }
}

async function handlePost(req: NextRequest) {
  try {
    if (!pushSubscriptionService.getPublicKey()) {
      return validationErrorResponse({
        endpoint: { _errors: ['Web push is not configured on this server'] },
      });
    }

    const validation = pushSubscribeSchema.safeParse(await req.json());
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const subscription = await pushSubscriptionService.subscribe(
      validation.data,
      req.headers.get('user-agent')
    );
    return successResponse(subscription, 'This device will receive push notifications');
  } catch {
    return serverErrorResponse('Failed to register push subscription');
  }
}

async function handleDelete(req: NextRequest) {
  try {
    const validation = pushUnsubscribeSchema.safeParse(await req.json());
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const removed = await pushSubscriptionService.unsubscribe(validation.data);
    return successResponse(removed ?? null, 'This device will no longer receive push');
  } catch {
    return serverErrorResponse('Failed to remove push subscription');
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
export const DELETE = withAdminAuth(handleDelete);
