import { createId } from '@paralleldrive/cuid2';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationChannels, notificationOutbox } from '@/lib/db/schema';
import type {
  CreateChannelInput,
  UpdateChannelInput,
} from '@/lib/validations/notifications.schema';

type NotificationChannel = typeof notificationChannels.$inferSelect;
type CreateRecord = typeof notificationChannels.$inferInsert;
type UpdateRecord = Partial<CreateRecord>;

export interface NotificationChannelsDatabase {
  list(): Promise<readonly NotificationChannel[]>;
  findById(id: string): Promise<NotificationChannel | undefined>;
  create(input: CreateRecord): Promise<NotificationChannel>;
  update(id: string, input: UpdateRecord): Promise<NotificationChannel | undefined>;
  remove(id: string): Promise<NotificationChannel | undefined>;
  countPendingDeliveries(channelId: string): Promise<number>;
}

const drizzleNotificationChannelsDatabase: NotificationChannelsDatabase = {
  async list() {
    return db.select().from(notificationChannels).orderBy(asc(notificationChannels.createdAt));
  },
  async findById(id) {
    const [channel] = await db
      .select()
      .from(notificationChannels)
      .where(eq(notificationChannels.id, id))
      .limit(1);
    return channel;
  },
  async create(input) {
    const [channel] = await db.insert(notificationChannels).values(input).returning();
    if (!channel) {
      throw new NotificationChannelPersistenceError('create');
    }
    return channel;
  },
  async update(id, input) {
    const [channel] = await db
      .update(notificationChannels)
      .set(input)
      .where(eq(notificationChannels.id, id))
      .returning();
    return channel;
  },
  async remove(id) {
    const [channel] = await db
      .delete(notificationChannels)
      .where(eq(notificationChannels.id, id))
      .returning();
    return channel;
  },
  async countPendingDeliveries(channelId) {
    const [result] = await db
      .select({ total: count() })
      .from(notificationOutbox)
      .where(
        and(
          eq(notificationOutbox.channelId, channelId),
          inArray(notificationOutbox.status, ['pending', 'failed'])
        )
      );
    return result?.total ?? 0;
  },
};

class NotificationChannelPersistenceError extends Error {
  readonly name = 'NotificationChannelPersistenceError';

  constructor(readonly operation: 'create') {
    super(`Failed to ${operation} notification channel`);
  }
}

export type RemoveChannelResult =
  | { readonly ok: true; readonly channel: NotificationChannel | undefined }
  | {
      readonly ok: false;
      readonly code: 'channel_in_use';
      readonly message: 'Channel still has undelivered notifications queued';
    };

export class NotificationChannelsService {
  constructor(
    private readonly database: NotificationChannelsDatabase = drizzleNotificationChannelsDatabase
  ) {}

  list() {
    return this.database.list();
  }

  findById(id: string) {
    return this.database.findById(id);
  }

  create(input: CreateChannelInput) {
    return this.database.create({
      id: createId(),
      ...input,
      updatedAt: new Date().toISOString(),
    });
  }

  update(id: string, input: UpdateChannelInput) {
    return this.database.update(id, { ...input, updatedAt: new Date().toISOString() });
  }

  async remove(id: string): Promise<RemoveChannelResult> {
    if ((await this.database.countPendingDeliveries(id)) > 0) {
      return {
        ok: false,
        code: 'channel_in_use',
        message: 'Channel still has undelivered notifications queued',
      };
    }

    return { ok: true, channel: await this.database.remove(id) };
  }
}

export const notificationChannelsService = new NotificationChannelsService();
