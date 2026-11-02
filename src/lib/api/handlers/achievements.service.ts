import { db } from '@/lib/db';
import { achievements } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { normalizeStoredAssetValue } from '@/lib/services/storage';

type AchievementInsert = typeof achievements.$inferInsert;
type AchievementCreateInput = Omit<AchievementInsert, 'id' | 'updatedAt'>;
type AchievementUpdateInput = Partial<AchievementCreateInput>;

function normalizeAchievementPhotos(photos: string[] | null | undefined): string[] {
  return (photos ?? []).flatMap((photo) => {
    const normalized = normalizeStoredAssetValue(photo);
    return normalized ? [normalized] : [];
  });
}

export class AchievementsService {
  async getAll(query?: { visible?: boolean }) {
    if (query?.visible !== undefined) {
      return db
        .select()
        .from(achievements)
        .where(eq(achievements.visible, query.visible))
        .orderBy(asc(achievements.order));
    }

    return db.select().from(achievements).orderBy(asc(achievements.order));
  }

  async getById(id: string) {
    const result = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
    return result[0] || null;
  }

  async create(data: AchievementCreateInput) {
    const [created] = await db
      .insert(achievements)
      .values({
        id: createId(),
        updatedAt: new Date().toISOString(),
        ...data,
        photos: normalizeAchievementPhotos(data.photos),
      })
      .returning();
    return created;
  }

  async update(id: string, data: AchievementUpdateInput) {
    const normalizedData = {
      ...data,
      ...(data.photos ? { photos: normalizeAchievementPhotos(data.photos) } : {}),
    };

    const [updated] = await db
      .update(achievements)
      .set({
        ...normalizedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(achievements.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  async reorder(achievementIds: string[]) {
    await db.transaction(async (tx) => {
      for (const [index, id] of achievementIds.entries()) {
        await tx
          .update(achievements)
          .set({ order: index, updatedAt: new Date().toISOString() })
          .where(eq(achievements.id, id));
      }
    });

    return db.select().from(achievements).orderBy(asc(achievements.order));
  }

  async toggleVisibility(id: string) {
    const result = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
    const achievement = result[0];

    if (!achievement) {
      return null;
    }

    const [updated] = await db
      .update(achievements)
      .set({
        visible: !achievement.visible,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(achievements.id, id))
      .returning();
    return updated;
  }
}

export const achievementsService = new AchievementsService();
