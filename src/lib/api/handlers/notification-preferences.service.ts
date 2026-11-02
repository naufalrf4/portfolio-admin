import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationPreferences } from '@/lib/db/schema';
import { PREFERENCE_CHANNELS } from '@/lib/notifications/channels';
import type { PreferenceChannel } from '@/lib/notifications/channels';
import { notificationEventTypeSchema } from '@/lib/services/notificationService';
import type { NotificationEventType } from '@/lib/services/notificationService';
import type { SavePreferenceInput } from '@/lib/validations/notifications.schema';

export type PreferenceRow = {
  readonly eventType: NotificationEventType;
  readonly channel: PreferenceChannel;
  readonly enabled: boolean;
};

export interface NotificationPreferenceDatabase {
  list(): Promise<readonly PreferenceRow[]>;
  save(input: SavePreferenceInput): Promise<void>;
}

const drizzleNotificationPreferenceDatabase: NotificationPreferenceDatabase = {
  async list() {
    const rows = await db
      .select({
        eventType: notificationPreferences.eventType,
        channel: notificationPreferences.channel,
        enabled: notificationPreferences.enabled,
      })
      .from(notificationPreferences);

    return rows.flatMap((row) => {
      const eventType = notificationEventTypeSchema.safeParse(row.eventType);
      const isKnownChannel = PREFERENCE_CHANNELS.includes(row.channel as PreferenceChannel);

      return eventType.success && isKnownChannel
        ? [
            {
              eventType: eventType.data,
              channel: row.channel as PreferenceChannel,
              enabled: row.enabled,
            },
          ]
        : [];
    });
  },
  async save(input) {
    const now = new Date().toISOString();
    await db
      .insert(notificationPreferences)
      .values({
        id: `${input.eventType}:${input.channel}`,
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

export class NotificationPreferenceService {
  constructor(
    private readonly database: NotificationPreferenceDatabase = drizzleNotificationPreferenceDatabase
  ) {}

  // Every event/channel pair is returned, defaulting to disabled, so the UI can
  // render a complete matrix without seeding rows first.
  async matrix(): Promise<readonly PreferenceRow[]> {
    const stored = await this.database.list();
    const lookup = new Map(stored.map((row) => [`${row.eventType}:${row.channel}`, row.enabled]));

    return notificationEventTypeSchema.options.flatMap((eventType) =>
      PREFERENCE_CHANNELS.map((channel) => ({
        eventType,
        channel,
        enabled: lookup.get(`${eventType}:${channel}`) ?? false,
      }))
    );
  }

  async save(input: SavePreferenceInput): Promise<void> {
    await this.database.save(input);
  }

  async isEnabled(eventType: NotificationEventType, channel: PreferenceChannel): Promise<boolean> {
    const [row] = await db
      .select({ enabled: notificationPreferences.enabled })
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.eventType, eventType),
          eq(notificationPreferences.channel, channel)
        )
      )
      .limit(1);

    return row?.enabled ?? false;
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
