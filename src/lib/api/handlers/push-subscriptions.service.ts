import { createId } from '@paralleldrive/cuid2';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { isWebPushConfigured } from '@/lib/services/webPushService';
import type {
  PushSubscribeInput,
  PushUnsubscribeInput,
} from '@/lib/validations/notifications.schema';

export type PushSubscriptionRow = {
  readonly id: string;
  readonly endpoint: string;
  readonly label: string | null;
  readonly userAgent: string | null;
  readonly createdAt: string;
  readonly lastSeenAt: string;
};

export interface PushSubscriptionDatabase {
  list(): Promise<readonly PushSubscriptionRow[]>;
  upsert(input: {
    readonly endpoint: string;
    readonly p256dh: string;
    readonly auth: string;
    readonly label: string | null;
    readonly userAgent: string | null;
  }): Promise<PushSubscriptionRow | undefined>;
  removeByEndpoint(endpoint: string): Promise<PushSubscriptionRow | undefined>;
  removeById(id: string): Promise<PushSubscriptionRow | undefined>;
}

const selection = {
  id: pushSubscriptions.id,
  endpoint: pushSubscriptions.endpoint,
  label: pushSubscriptions.label,
  userAgent: pushSubscriptions.userAgent,
  createdAt: pushSubscriptions.createdAt,
  lastSeenAt: pushSubscriptions.lastSeenAt,
};

const drizzlePushSubscriptionDatabase: PushSubscriptionDatabase = {
  async list() {
    return db
      .select(selection)
      .from(pushSubscriptions)
      .orderBy(desc(pushSubscriptions.lastSeenAt));
  },
  async upsert(input) {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(pushSubscriptions)
      .values({
        id: createId(),
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        label: input.label,
        userAgent: input.userAgent,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          p256dh: input.p256dh,
          auth: input.auth,
          ...(input.label === null ? {} : { label: input.label }),
          userAgent: input.userAgent,
          lastSeenAt: now,
        },
      })
      .returning(selection);
    return row;
  },
  async removeByEndpoint(endpoint) {
    const [row] = await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .returning(selection);
    return row;
  },
  async removeById(id) {
    const [row] = await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id))
      .returning(selection);
    return row;
  },
};

export class PushSubscriptionService {
  constructor(
    private readonly database: PushSubscriptionDatabase = drizzlePushSubscriptionDatabase
  ) {}

  getPublicKey(): string | null {
    return isWebPushConfigured() ? (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null) : null;
  }

  list(): Promise<readonly PushSubscriptionRow[]> {
    return this.database.list();
  }

  subscribe(
    input: PushSubscribeInput,
    userAgent: string | null
  ): Promise<PushSubscriptionRow | undefined> {
    return this.database.upsert({
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      label: input.label ?? null,
      userAgent,
    });
  }

  unsubscribe(input: PushUnsubscribeInput): Promise<PushSubscriptionRow | undefined> {
    return this.database.removeByEndpoint(input.endpoint);
  }

  removeById(id: string): Promise<PushSubscriptionRow | undefined> {
    return this.database.removeById(id);
  }
}

export const pushSubscriptionService = new PushSubscriptionService();
