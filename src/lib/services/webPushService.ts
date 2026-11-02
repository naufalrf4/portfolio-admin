import webpush from 'web-push';
import type { PushSubscription } from 'web-push';

export type PushSendResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly gone: true; readonly description: string }
  | { readonly ok: false; readonly gone: false; readonly description: string };

export type PushTarget = {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
};

export type PushMessage = {
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly tag: string;
};

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

function configure(): void {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error('Web push is not configured');
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPush(
  target: PushTarget,
  message: PushMessage
): Promise<PushSendResult> {
  if (!isWebPushConfigured()) {
    return { ok: false, gone: false, description: 'Web push is not configured' };
  }

  configure();

  const subscription: PushSubscription = {
    endpoint: target.endpoint,
    keys: { p256dh: target.p256dh, auth: target.auth },
  };

  try {
    await webpush.sendNotification(subscription, JSON.stringify(message), { TTL: 3600 });
    return { ok: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    const description =
      error instanceof Error ? error.message : `Push delivery failed: ${String(error)}`;

    return {
      ok: false,
      gone: statusCode === 404 || statusCode === 410,
      description,
    };
  }
}
