import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationOutbox, pushSubscriptions } from '@/lib/db/schema';
import type { DeliveryChannel } from '@/lib/notifications/channels';
import type { TelegramSendResult } from '@/lib/services/telegramService';
import type { PushSendResult } from '@/lib/services/webPushService';

const CLAIM_LIMIT = 15;
const MESSAGE_SPACING_MS = 1100;
const MAX_ATTEMPTS = 5;

export type ClaimedNotification = {
  readonly id: string;
  readonly channel: DeliveryChannel;
  readonly attempts: number;
  readonly chatId: string | null;
  readonly messageThreadId: number | null;
  readonly text: string | null;
  readonly subscriptionId: string | null;
  readonly endpoint: string | null;
  readonly p256dh: string | null;
  readonly auth: string | null;
  readonly title: string | null;
  readonly body: string | null;
  readonly link: string | null;
  readonly tag: string | null;
};

export interface NotificationDispatchDatabase {
  withClaimedPending<T>(
    limit: number,
    handler: (
      notifications: readonly ClaimedNotification[],
      updates: NotificationDispatchUpdates
    ) => Promise<T>
  ): Promise<T>;
}

export interface NotificationDispatchUpdates {
  markSent(id: string, messageId: number | null): Promise<void>;
  markFailed(
    id: string,
    attempts: number,
    status: 'failed' | 'dead',
    error: string
  ): Promise<void>;
  defer(id: string, retryAfter: number): Promise<void>;
  dropSubscription(subscriptionId: string): Promise<void>;
}

type DispatchDependencies = {
  readonly send: (input: {
    readonly chatId: string;
    readonly messageThreadId: number | null;
    readonly text: string;
  }) => Promise<TelegramSendResult>;
  readonly sendPush: (
    target: { readonly endpoint: string; readonly p256dh: string; readonly auth: string },
    message: {
      readonly title: string;
      readonly body: string;
      readonly link: string | null;
      readonly tag: string;
    }
  ) => Promise<PushSendResult>;
  readonly sleep: (milliseconds: number) => Promise<void>;
  readonly database?: NotificationDispatchDatabase;
};

export type DispatchResult = {
  readonly claimed: number;
  readonly sent: number;
  readonly failed: number;
  readonly dead: number;
  readonly throttled: boolean;
};

const drizzleNotificationDispatchDatabase: NotificationDispatchDatabase = {
  async withClaimedPending(limit, handler) {
    return db.transaction(async (tx) => {
      const notifications = await tx.execute<ClaimedNotification>(sql`
        select
          outbox.id,
          outbox.channel,
          outbox.attempts,
          channel.chat_id as "chatId",
          channel.message_thread_id as "messageThreadId",
          outbox.payload->>'text' as text,
          outbox.subscription_id as "subscriptionId",
          subscription.endpoint,
          subscription.p256dh,
          subscription.auth,
          outbox.payload->>'title' as title,
          outbox.payload->>'body' as body,
          outbox.payload->>'link' as link,
          outbox.payload->>'tag' as tag
        from notification_outbox as outbox
        left join notification_channels as channel
          on channel.id = outbox.channel_id and channel.enabled = true
        left join push_subscriptions as subscription
          on subscription.id = outbox.subscription_id
        where outbox.status = 'pending' and outbox.next_attempt_at <= now()
        order by outbox."createdAt" asc
        limit ${limit}
        for update of outbox skip locked
      `);
      const updates: NotificationDispatchUpdates = {
        async markSent(id, messageId) {
          await tx
            .update(notificationOutbox)
            .set({
              status: 'sent',
              sentAt: new Date().toISOString(),
              ...(messageId === null ? {} : { telegramMessageId: messageId }),
            })
            .where(eq(notificationOutbox.id, id));
        },
        async markFailed(id, attempts, status, error) {
          const backoffSeconds = 2 ** Math.min(attempts, 10);
          await tx
            .update(notificationOutbox)
            .set({
              attempts,
              status,
              lastError: error,
              nextAttemptAt: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
            })
            .where(eq(notificationOutbox.id, id));
        },
        async defer(id, retryAfter) {
          await tx
            .update(notificationOutbox)
            .set({ nextAttemptAt: new Date(Date.now() + retryAfter * 1000).toISOString() })
            .where(eq(notificationOutbox.id, id));
        },
        async dropSubscription(subscriptionId) {
          await tx.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscriptionId));
        },
      };
      return handler(notifications, updates);
    });
  },
};

export class NotificationDispatchService {
  constructor(
    private readonly database: NotificationDispatchDatabase = drizzleNotificationDispatchDatabase
  ) {}

  async dispatch({ send, sendPush, sleep }: DispatchDependencies): Promise<DispatchResult> {
    return this.database.withClaimedPending(CLAIM_LIMIT, async (claimed, updates) => {
      let sent = 0;
      let failed = 0;
      let dead = 0;
      let telegramSends = 0;

      const fail = async (notification: ClaimedNotification, description: string) => {
        const attempts = notification.attempts + 1;
        const status = attempts >= MAX_ATTEMPTS ? 'dead' : 'failed';
        await updates.markFailed(notification.id, attempts, status, description);

        if (status === 'dead') {
          dead += 1;
        } else {
          failed += 1;
        }
      };

      for (const notification of claimed) {
        if (notification.channel === 'webpush') {
          if (!notification.endpoint || !notification.p256dh || !notification.auth) {
            await fail(notification, 'Push subscription is missing or incomplete');
            continue;
          }

          const result = await sendPush(
            {
              endpoint: notification.endpoint,
              p256dh: notification.p256dh,
              auth: notification.auth,
            },
            {
              title: notification.title ?? 'Notification',
              body: notification.body ?? '',
              link: notification.link,
              tag: notification.tag ?? notification.id,
            }
          );

          if (result.ok) {
            await updates.markSent(notification.id, null);
            sent += 1;
            continue;
          }

          if (result.gone && notification.subscriptionId) {
            await updates.dropSubscription(notification.subscriptionId);
          }

          await fail(notification, result.description);
          continue;
        }

        if (!notification.chatId || notification.text === null) {
          await fail(notification, 'Telegram channel is disabled or missing');
          continue;
        }

        // Telegram rate limits per bot, so only Telegram sends are spaced.
        if (telegramSends > 0) {
          await sleep(MESSAGE_SPACING_MS);
        }

        telegramSends += 1;

        const result = await send({
          chatId: notification.chatId,
          messageThreadId: notification.messageThreadId,
          text: notification.text,
        });

        if (result.ok) {
          await updates.markSent(notification.id, result.messageId);
          sent += 1;
          continue;
        }

        if (result.status === 429) {
          await updates.defer(notification.id, result.retryAfter ?? 60);
          return { claimed: claimed.length, sent, failed, dead, throttled: true };
        }

        await fail(notification, result.description);
      }

      return { claimed: claimed.length, sent, failed, dead, throttled: false };
    });
  }
}

export const notificationDispatchService = new NotificationDispatchService();

export async function dispatchPendingNotifications(
  dependencies: DispatchDependencies
): Promise<DispatchResult> {
  const service = dependencies.database
    ? new NotificationDispatchService(dependencies.database)
    : notificationDispatchService;
  return service.dispatch(dependencies);
}
