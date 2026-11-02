import { db } from '@/lib/db';
import { blogLink } from '@/lib/db/schema';
import { eq, asc, and, max } from 'drizzle-orm';
import type { CreateBlogLinkInput } from '@/lib/validations/blog-link.schema';
import { createId } from '@paralleldrive/cuid2';
import { normalizeStoredAssetValue } from '@/lib/services/storage';

export type BlogLinkCreateInput = CreateBlogLinkInput;
type BlogLinkUpdateInput = Partial<BlogLinkCreateInput>;

export class PublicationLinksService {
  async getAll(query?: { source?: string; visible?: boolean }) {
    const conditions = [];
    if (query?.source) {
      conditions.push(eq(blogLink.source, query.source));
    }
    if (query?.visible !== undefined) {
      conditions.push(eq(blogLink.visible, query.visible));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(blogLink)
        .where(and(...conditions))
        .orderBy(asc(blogLink.order));
    }

    return db.select().from(blogLink).orderBy(asc(blogLink.order));
  }

  async getById(id: string) {
    const result = await db.select().from(blogLink).where(eq(blogLink.id, id)).limit(1);
    return result[0] || null;
  }

  async create(data: BlogLinkCreateInput) {
    const maxOrderResult = await db.select({ maxOrder: max(blogLink.order) }).from(blogLink);
    const maxOrder = maxOrderResult[0]?.maxOrder ?? -1;

    const [created] = await db
      .insert(blogLink)
      .values({
        id: createId(),
        updatedAt: new Date().toISOString(),
        url: data.url,
        title: data.title,
        description: data.description || null,
        imageUrl: normalizeStoredAssetValue(data.imageUrl),
        source: data.source,
        tags: data.tags || [],
        publishedAt: data.publishedAt
          ? new Date(data.publishedAt).toISOString()
          : new Date().toISOString(),
        order: maxOrder + 1,
        visible: true,
      })
      .returning();

    return created;
  }

  async update(id: string, data: BlogLinkUpdateInput) {
    const [updated] = await db
      .update(blogLink)
      .set({
        ...data,
        imageUrl: normalizeStoredAssetValue(data.imageUrl),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogLink.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await db.delete(blogLink).where(eq(blogLink.id, id));
  }

  async reorder(blogIds: string[]) {
    await db.transaction(async (tx) => {
      for (const [index, id] of blogIds.entries()) {
        await tx
          .update(blogLink)
          .set({ order: index, updatedAt: new Date().toISOString() })
          .where(eq(blogLink.id, id));
      }
    });

    return db.select().from(blogLink).orderBy(asc(blogLink.order));
  }

  async toggleVisibility(id: string) {
    const result = await db.select().from(blogLink).where(eq(blogLink.id, id)).limit(1);
    const blogLinkData = result[0];

    if (!blogLinkData) {
      return null;
    }

    const [updated] = await db
      .update(blogLink)
      .set({
        visible: !blogLinkData.visible,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogLink.id, id))
      .returning();
    return updated;
  }
}

export const publicationLinksService = new PublicationLinksService();
