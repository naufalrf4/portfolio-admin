import { db } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';
import { anonymousMessages } from '@/lib/db/schema';

const anonymousMessageSelect = {
  id: anonymousMessages.id,
  content: anonymousMessages.content,
  ipHash: anonymousMessages.ipHash,
  read: anonymousMessages.read,
  createdAt: anonymousMessages.createdAt,
  updatedAt: anonymousMessages.updatedAt,
  city: anonymousMessages.city,
  country: anonymousMessages.country,
  countryCode: anonymousMessages.countryCode,
  ipAddress: anonymousMessages.ipAddress,
  region: anonymousMessages.region,
};

function isMissingMetadataColumnError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (!cause || typeof cause !== 'object') {
    return false;
  }

  const code = 'code' in cause ? cause.code : undefined;
  const message = 'message' in cause ? cause.message : undefined;
  return code === '42703' && typeof message === 'string' && message.includes('metadata');
}

type AnonymousMessageCreateInput = {
  id: string;
  content: string;
  ipHash: string;
  ipAddress?: string | null;
  countryCode?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  metadata?: object | null;
  read?: boolean;
  createdAt: string;
  updatedAt: string;
};

export class AnonymousMessagesService {
  async getAll(filters?: { read?: boolean }) {
    const whereClause =
      filters?.read !== undefined ? eq(anonymousMessages.read, filters.read) : undefined;

    const [messages, [{ unreadCount }]] = await Promise.all([
      db
        .select(anonymousMessageSelect)
        .from(anonymousMessages)
        .where(whereClause)
        .orderBy(desc(anonymousMessages.createdAt)),
      db
        .select({ unreadCount: count() })
        .from(anonymousMessages)
        .where(eq(anonymousMessages.read, false)),
    ]);

    return {
      messages,
      unreadCount,
    };
  }

  async getById(id: string) {
    const [message] = await db
      .select(anonymousMessageSelect)
      .from(anonymousMessages)
      .where(eq(anonymousMessages.id, id))
      .limit(1);
    return message || null;
  }

  async create(data: AnonymousMessageCreateInput) {
    const valuesWithMetadata = {
      ...data,
      metadata: data.metadata ?? {},
    };

    try {
      const [message] = await db
        .insert(anonymousMessages)
        .values(valuesWithMetadata)
        .returning(anonymousMessageSelect);
      return message;
    } catch (error) {
      if (!isMissingMetadataColumnError(error)) {
        throw error;
      }

      const valuesWithoutMetadata = {
        id: data.id,
        content: data.content,
        ipHash: data.ipHash,
        read: data.read ?? false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ipAddress: data.ipAddress ?? null,
        countryCode: data.countryCode ?? null,
        country: data.country ?? null,
        city: data.city ?? null,
        region: data.region ?? null,
      };
      const [message] = await db
        .insert(anonymousMessages)
        .values(valuesWithoutMetadata)
        .returning(anonymousMessageSelect);
      return message;
    }
  }

  async markAsRead(id: string) {
    const now = new Date().toISOString();
    const [updated] = await db
      .update(anonymousMessages)
      .set({ read: true, updatedAt: now })
      .where(eq(anonymousMessages.id, id))
      .returning(anonymousMessageSelect);
    return updated;
  }

  async markAsUnread(id: string) {
    const now = new Date().toISOString();
    const [updated] = await db
      .update(anonymousMessages)
      .set({ read: false, updatedAt: now })
      .where(eq(anonymousMessages.id, id))
      .returning(anonymousMessageSelect);
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(anonymousMessages)
      .where(eq(anonymousMessages.id, id))
      .returning(anonymousMessageSelect);
    return deleted;
  }

  async getUnreadCount() {
    const [{ total }] = await db
      .select({ total: count() })
      .from(anonymousMessages)
      .where(eq(anonymousMessages.read, false));
    return total;
  }
}

export const anonymousMessagesService = new AnonymousMessagesService();
