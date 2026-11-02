import { and, desc, eq, inArray } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationChannels, notificationOutbox, pushSubscriptions } from '@/lib/db/schema';
import type { OutboxQuery } from '@/lib/validations/notifications.schema';

export type NotificationOutboxRow = {
  readonly id: string;
  readonly eventType: string;
  readonly channel: string;
  readonly channelId: string | null;
  readonly channelName: string | null;
  readonly target: string | null;
  readonly status: string;
  readonly attempts: number;
  readonly lastError: string | null;
  readonly telegramMessageId: number | null;
  readonly createdAt: string;
  readonly sentAt: string | null;
  readonly nextAttemptAt: string;
};

type RetryInput = {
  readonly id: string;
  readonly status: 'pending';
  readonly attempts: 0;
  readonly nextAttemptAt: string;
  readonly lastError: null;
};

type OutboxRecord = typeof notificationOutbox.$inferSelect;

export interface NotificationOutboxDatabase {
  list(input: OutboxQuery): Promise<readonly NotificationOutboxRow[]>;
  findById(id: string): Promise<NotificationOutboxRow | undefined>;
  retry(input: RetryInput): Promise<NotificationOutboxRow | undefined>;
}

const selection = {
  id: notificationOutbox.id,
  eventType: notificationOutbox.eventType,
  channel: notificationOutbox.channel,
  channelId: notificationOutbox.channelId,
  channelName: notificationChannels.name,
  target: pushSubscriptions.label,
  status: notificationOutbox.status,
  attempts: notificationOutbox.attempts,
  lastError: notificationOutbox.lastError,
  telegramMessageId: notificationOutbox.telegramMessageId,
  createdAt: notificationOutbox.createdAt,
  sentAt: notificationOutbox.sentAt,
  nextAttemptAt: notificationOutbox.nextAttemptAt,
};

// Left joins: a web-push row has no Telegram channel, and a Telegram row has no
// push subscription. An inner join would silently drop half the queue.
function baseQuery() {
  return db
    .select(selection)
    .from(notificationOutbox)
    .leftJoin(notificationChannels, eq(notificationOutbox.channelId, notificationChannels.id))
    .leftJoin(pushSubscriptions, eq(notificationOutbox.subscriptionId, pushSubscriptions.id));
}

const drizzleNotificationOutboxDatabase: NotificationOutboxDatabase = {
  async list(input) {
    const filters: (SQL | undefined)[] = [
      input.status === undefined ? undefined : eq(notificationOutbox.status, input.status),
      input.channel === undefined ? undefined : eq(notificationOutbox.channel, input.channel),
    ];
    const active = filters.filter((filter): filter is SQL => filter !== undefined);

    return baseQuery()
      .where(active.length === 0 ? undefined : and(...active))
      .orderBy(desc(notificationOutbox.createdAt))
      .limit(input.limit);
  },
  async findById(id) {
    const [row] = await baseQuery().where(eq(notificationOutbox.id, id)).limit(1);
    return row;
  },
  async retry(input) {
    const [updated]: Pick<OutboxRecord, 'id'>[] = await db
      .update(notificationOutbox)
      .set({
        status: input.status,
        attempts: input.attempts,
        nextAttemptAt: input.nextAttemptAt,
        lastError: input.lastError,
      })
      .where(
        and(
          eq(notificationOutbox.id, input.id),
          inArray(notificationOutbox.status, ['failed', 'dead'])
        )
      )
      .returning({ id: notificationOutbox.id });
    if (!updated) {
      return undefined;
    }
    return this.findById(input.id);
  },
};

export type RetryOutboxResult =
  | { readonly ok: true; readonly delivery: NotificationOutboxRow | undefined }
  | { readonly ok: false; readonly code: 'not_found' }
  | {
      readonly ok: false;
      readonly code: 'not_retryable';
      readonly message: 'Only failed or dead notifications can be retried';
    };

export class NotificationOutboxService {
  constructor(
    private readonly database: NotificationOutboxDatabase = drizzleNotificationOutboxDatabase
  ) {}

  list(input: OutboxQuery) {
    return this.database.list(input);
  }

  async retry(id: string): Promise<RetryOutboxResult> {
    const delivery = await this.database.findById(id);
    if (!delivery) {
      return { ok: false, code: 'not_found' };
    }
    if (delivery.status !== 'failed' && delivery.status !== 'dead') {
      return {
        ok: false,
        code: 'not_retryable',
        message: 'Only failed or dead notifications can be retried',
      };
    }

    return {
      ok: true,
      delivery: await this.database.retry({
        id,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: new Date().toISOString(),
        lastError: null,
      }),
    };
  }
}

export const notificationOutboxService = new NotificationOutboxService();
