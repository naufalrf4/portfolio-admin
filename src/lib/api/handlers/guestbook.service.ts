import { createId } from '@paralleldrive/cuid2';

type GuestbookEntryUpdate = Partial<
  Pick<typeof guestbookEntries.$inferInsert, 'message' | 'visible' | 'reactions' | 'updatedAt'>
>;
type GuestbookReaction = { userId: string; emoji: string };
import { db } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { guestbookEntries } from '@/lib/db/schema';

export class GuestbookService {
  async getAll(query?: { userId?: string; visible?: boolean }) {
    const conditions = [];
    if (query?.userId) conditions.push(eq(guestbookEntries.userId, query.userId));
    if (query?.visible !== undefined) conditions.push(eq(guestbookEntries.visible, query.visible));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db.query.guestbookEntries.findMany({
      where: whereClause,
      orderBy: [desc(guestbookEntries.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async create(
    userId: string,
    message: string,
    locationData?: {
      ipHash?: string | null;
      ipAddress?: string;
      countryCode?: string;
      country?: string;
      city?: string;
      region?: string;
      metadata?: Record<string, unknown> | null;
    }
  ) {
    const now = new Date().toISOString();
    const [created] = await db
      .insert(guestbookEntries)
      .values({
        id: createId(),
        userId,
        message,
        visible: true,
        ipHash: locationData?.ipHash || null,
        ipAddress: locationData?.ipAddress || null,
        countryCode: locationData?.countryCode || null,
        country: locationData?.country || null,
        city: locationData?.city || null,
        region: locationData?.region || null,
        metadata: locationData?.metadata || {},
        reactions: [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, created.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Omit<GuestbookEntryUpdate, 'updatedAt'>) {
    const updateData: GuestbookEntryUpdate = { ...data, updatedAt: new Date().toISOString() };
    const [updated] = await db
      .update(guestbookEntries)
      .set(updateData)
      .where(eq(guestbookEntries.id, id))
      .returning();

    if (!updated) {
      throw new Error('Guestbook entry not found');
    }

    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(guestbookEntries)
      .where(eq(guestbookEntries.id, id))
      .returning();
    return deleted;
  }

  async toggleVisibility(id: string) {
    const [entry] = await db
      .select({ visible: guestbookEntries.visible })
      .from(guestbookEntries)
      .where(eq(guestbookEntries.id, id))
      .limit(1);
    if (!entry) {
      throw new Error('Guestbook entry not found');
    }

    const [updated] = await db
      .update(guestbookEntries)
      .set({ visible: !entry.visible, updatedAt: new Date().toISOString() })
      .where(eq(guestbookEntries.id, id))
      .returning();

    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, updated.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async updateReactions(id: string, reactions: GuestbookReaction[]) {
    const updateData: GuestbookEntryUpdate = {
      reactions,
      updatedAt: new Date().toISOString(),
    };
    const [updated] = await db
      .update(guestbookEntries)
      .set(updateData)
      .where(eq(guestbookEntries.id, id))
      .returning();

    if (!updated) {
      throw new Error('Guestbook entry not found');
    }

    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }
  async addReaction(id: string, userId: string, emoji: string) {
    const [entry] = await db
      .select({ reactions: guestbookEntries.reactions })
      .from(guestbookEntries)
      .where(eq(guestbookEntries.id, id))
      .limit(1);
    if (!entry) {
      throw new Error('Guestbook entry not found');
    }
    const reactions = (entry.reactions as GuestbookReaction[] | null) || [];
    const existingIndex = reactions.findIndex((r) => r.userId === userId && r.emoji === emoji);
    if (existingIndex !== -1) {
      reactions.splice(existingIndex, 1);
    } else {
      reactions.push({ userId, emoji });
    }

    const updateData: GuestbookEntryUpdate = {
      reactions,
      updatedAt: new Date().toISOString(),
    };
    await db
      .update(guestbookEntries)
      .set(updateData)
      .where(eq(guestbookEntries.id, id))
      .returning();

    return db.query.guestbookEntries.findFirst({
      where: eq(guestbookEntries.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }
}

export const guestbookService = new GuestbookService();
