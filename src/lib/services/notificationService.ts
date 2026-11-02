import { createId } from '@paralleldrive/cuid2';
import { meetsLevel } from '@naufalrf/contracts';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  notificationChannels,
  notificationOutbox,
  notificationPreferences,
  notifications,
  pushSubscriptions,
} from '@/lib/db/schema';
import { PREFERENCE_CHANNELS } from '@/lib/notifications/channels';
import type { DeliveryChannel, PreferenceChannel } from '@/lib/notifications/channels';
import { buildNotificationContent } from '@/lib/notifications/content';
import type { NotificationContent } from '@/lib/notifications/content';
import {
  getLogErrorLevel,
  notificationEventTypeSchema,
  renderNotification,
} from '@/lib/notifications/templates';
import type { NotificationEventType } from '@/lib/notifications/templates';
import { logger } from '@/lib/utils/logger';

export { notificationEventTypeSchema, getLogErrorLevel };
export type { NotificationEventType };

export const SUBMISSION_EVENT_TYPES = [
  'contact.created',
  'booking.created',
  'booking.status_changed',
  'message.created',
  'guestbook.created',
] as const satisfies readonly NotificationEventType[];

const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

export type SavePreferenceInput = {
  readonly eventType: NotificationEventType;
  readonly channel: PreferenceChannel;
  readonly enabled: boolean;
};

type OutboxRecord = {
  readonly id: string;
  readonly eventType: NotificationEventType;
  readonly notificationId: string;
  readonly channel: DeliveryChannel;
  readonly channelId: string | null;
  readonly subscriptionId: string | null;
  readonly payload: Record<string, unknown>;
  readonly status: 'pending';
  readonly attempts: 0;
};

export type EnqueueResult = {
  readonly notificationId: string | null;
  readonly enqueued: number;
};

export interface NotificationDatabase {
  findEnabledPreferences(
    eventType: NotificationEventType
  ): Promise<readonly PreferenceChannel[]>;
  insertNotification(record: {
    readonly id: string;
    readonly eventType: NotificationEventType;
    readonly title: string;
    readonly body: string;
    readonly link: string | null;
    readonly level: string;
    readonly payload: unknown;
  }): Promise<void>;
  findTelegramChannelIds(): Promise<readonly string[]>;
  findPushSubscriptionIds(): Promise<readonly string[]>;
  insertOutbox(records: readonly OutboxRecord[]): Promise<void>;
  savePreference(input: SavePreferenceInput): Promise<void>;
}

const drizzleNotificationDatabase: NotificationDatabase = {
  async findEnabledPreferences(eventType) {
    const rows = await db
      .select({ channel: notificationPreferences.channel })
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.eventType, eventType),
          eq(notificationPreferences.enabled, true)
        )
      );

    return rows
      .map((row) => row.channel)
      .filter((channel): channel is PreferenceChannel =>
        PREFERENCE_CHANNELS.includes(channel as PreferenceChannel)
      );
  },
  async insertNotification(record) {
    await db.insert(notifications).values(record);
  },
  async findTelegramChannelIds() {
    const rows = await db
      .select({ id: notificationChannels.id })
      .from(notificationChannels)
      .where(eq(notificationChannels.enabled, true));

    return rows.map((row) => row.id);
  },
  async findPushSubscriptionIds() {
    const rows = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions);
    return rows.map((row) => row.id);
  },
  async insertOutbox(records) {
    if (records.length === 0) {
      return;
    }

    await db.insert(notificationOutbox).values([...records]);
  },
  async savePreference(input) {
    const now = new Date().toISOString();
    await db
      .insert(notificationPreferences)
      .values({
        id: createId(),
        eventType: input.eventType,
        channel: input.channel,
        enabled: input.enabled,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [notificationPreferences.eventType, notificationPreferences.channel],
        set: { enabled: input.enabled, updatedAt: now },
      });
  },
};

export class NotificationService {
  constructor(private readonly database: NotificationDatabase = drizzleNotificationDatabase) {}

  async enqueue(eventType: NotificationEventType, payload: unknown): Promise<EnqueueResult> {
    let content: NotificationContent;

    try {
      content = buildNotificationContent(eventType, payload);
    } catch (error) {
      logger.error('Notification content build failed', error, {
        operation: 'notification.enqueue',
        eventType,
      });
      return { notificationId: null, enqueued: 0 };
    }

    const notificationId = createId();

    try {
      await this.database.insertNotification({
        id: notificationId,
        eventType,
        title: content.title,
        body: content.body,
        link: content.link,
        level: content.level,
        payload: payload ?? null,
      });
    } catch (error) {
      logger.error('In-app notification insert failed', error, {
        operation: 'notification.enqueue',
        eventType,
      });
      return { notificationId: null, enqueued: 0 };
    }

    try {
      const records: OutboxRecord[] = [];

      // Push mirrors the in-app notification to whichever devices the admin
      // registered. No per-event toggle: subscribing a device IS the opt-in.
      const subscriptionIds = await this.database.findPushSubscriptionIds();

      for (const subscriptionId of subscriptionIds) {
        records.push({
          id: createId(),
          eventType,
          notificationId,
          channel: 'webpush',
          channelId: null,
          subscriptionId,
          payload: {
            title: content.title,
            body: content.body,
            link: content.link,
            tag: notificationId,
          },
          status: 'pending',
          attempts: 0,
        });
      }

      const enabled = await this.database.findEnabledPreferences(eventType);

      if (enabled.includes('telegram')) {
        const text = renderNotification(eventType, payload);
        const channelIds = await this.database.findTelegramChannelIds();

        for (const channelId of channelIds) {
          records.push({
            id: createId(),
            eventType,
            notificationId,
            channel: 'telegram',
            channelId,
            subscriptionId: null,
            payload: { text },
            status: 'pending',
            attempts: 0,
          });
        }
      }

      await this.database.insertOutbox(records);
      return { notificationId, enqueued: records.length };
    } catch (error) {
      logger.error('Notification fan-out failed', error, {
        operation: 'notification.enqueue',
        eventType,
        notificationId,
      });
      return { notificationId, enqueued: 0 };
    }
  }

  async savePreference(input: SavePreferenceInput): Promise<void> {
    await this.database.savePreference(input);
  }
}

export const notificationService = new NotificationService();

export function shouldEscalateLogLevel(
  level: string,
  threshold: string | null | undefined
): boolean {
  const parsedLevel = logLevelSchema.safeParse(level);
  const parsedThreshold = logLevelSchema.safeParse(threshold ?? 'error');

  if (!parsedLevel.success || !parsedThreshold.success) {
    return false;
  }

  return meetsLevel(parsedLevel.data, parsedThreshold.data);
}
