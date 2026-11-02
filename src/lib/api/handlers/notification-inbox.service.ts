import { and, count, desc, eq, isNull, lt, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import type { InboxQuery } from '@/lib/validations/notifications.schema';

export type NotificationRow = typeof notifications.$inferSelect;

export type InboxPage = {
  readonly notifications: readonly NotificationRow[];
  readonly nextCursor: string | null;
  readonly unreadCount: number;
};

type Cursor = {
  readonly createdAt: string;
  readonly id: string;
};

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(`${cursor.createdAt}|${cursor.id}`, 'utf8').toString('base64url');
}

export function decodeCursor(value: string): Cursor | undefined {
  const decoded = Buffer.from(value, 'base64url').toString('utf8');
  const separator = decoded.lastIndexOf('|');

  if (separator <= 0) {
    return undefined;
  }

  const createdAt = decoded.slice(0, separator);
  const id = decoded.slice(separator + 1);

  if (!createdAt || !id || Number.isNaN(new Date(createdAt).getTime())) {
    return undefined;
  }

  return { createdAt, id };
}

export interface NotificationInboxDatabase {
  list(input: InboxQuery): Promise<readonly NotificationRow[]>;
  countUnread(): Promise<number>;
  markRead(id: string): Promise<NotificationRow | undefined>;
  markAllRead(): Promise<number>;
  remove(id: string): Promise<NotificationRow | undefined>;
  clearRead(): Promise<number>;
}

const drizzleNotificationInboxDatabase: NotificationInboxDatabase = {
  async list(input) {
    const cursor = input.cursor === undefined ? undefined : decodeCursor(input.cursor);
    const filters: (SQL | undefined)[] = [
      input.unreadOnly ? isNull(notifications.readAt) : undefined,
      cursor === undefined
        ? undefined
        : or(
            lt(notifications.createdAt, cursor.createdAt),
            and(eq(notifications.createdAt, cursor.createdAt), lt(notifications.id, cursor.id))
          ),
    ];
    const active = filters.filter((filter): filter is SQL => filter !== undefined);

    return db
      .select()
      .from(notifications)
      .where(active.length === 0 ? undefined : and(...active))
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(input.limit + 1);
  },
  async countUnread() {
    const [row] = await db
      .select({ total: count() })
      .from(notifications)
      .where(isNull(notifications.readAt));
    return row?.total ?? 0;
  },
  async markRead(id) {
    const [row] = await db
      .update(notifications)
      .set({ readAt: new Date().toISOString() })
      .where(and(eq(notifications.id, id), isNull(notifications.readAt)))
      .returning();

    if (row) {
      return row;
    }

    const [existing] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return existing;
  },
  async markAllRead() {
    const updated = await db
      .update(notifications)
      .set({ readAt: new Date().toISOString() })
      .where(isNull(notifications.readAt))
      .returning({ id: notifications.id });
    return updated.length;
  },
  async remove(id) {
    const [row] = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return row;
  },
  async clearRead() {
    const deleted = await db
      .delete(notifications)
      .where(sql`${notifications.readAt} is not null`)
      .returning({ id: notifications.id });
    return deleted.length;
  },
};

export class NotificationInboxService {
  constructor(
    private readonly database: NotificationInboxDatabase = drizzleNotificationInboxDatabase
  ) {}

  async list(input: InboxQuery): Promise<InboxPage> {
    const [rows, unreadCount] = await Promise.all([
      this.database.list(input),
      this.database.countUnread(),
    ]);

    const hasMore = rows.length > input.limit;
    const page = hasMore ? rows.slice(0, input.limit) : rows;
    const last = page.at(-1);

    return {
      notifications: page,
      nextCursor:
        hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
      unreadCount,
    };
  }

  countUnread(): Promise<number> {
    return this.database.countUnread();
  }

  markRead(id: string): Promise<NotificationRow | undefined> {
    return this.database.markRead(id);
  }

  markAllRead(): Promise<number> {
    return this.database.markAllRead();
  }

  remove(id: string): Promise<NotificationRow | undefined> {
    return this.database.remove(id);
  }

  clearRead(): Promise<number> {
    return this.database.clearRead();
  }
}

export const notificationInboxService = new NotificationInboxService();
