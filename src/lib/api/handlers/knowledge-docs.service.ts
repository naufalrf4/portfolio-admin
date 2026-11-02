import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';
import { eq, count, desc } from 'drizzle-orm';
import { knowledgeDocs } from '@/lib/db/schema';
import type {
  CreateKnowledgeDocInput,
  UpdateKnowledgeDocInput,
  KnowledgeDocQueryInput,
} from '@/lib/validations/knowledge.schema';

export class KnowledgeDocsService {
  async getAll(query: KnowledgeDocQueryInput) {
    const { page, limit, indexed } = query;
    const offset = (page - 1) * limit;

    const whereClause = indexed !== undefined ? eq(knowledgeDocs.indexed, indexed) : undefined;

    const [docs, [{ total }]] = await Promise.all([
      db
        .select()
        .from(knowledgeDocs)
        .where(whereClause)
        .offset(offset)
        .limit(limit)
        .orderBy(desc(knowledgeDocs.updatedAt)),
      db.select({ total: count() }).from(knowledgeDocs).where(whereClause),
    ]);
    return {
      docs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    return db.query.knowledgeDocs.findFirst({
      where: eq(knowledgeDocs.id, id),
    });
  }

  async getByFilename(filename: string) {
    return db.query.knowledgeDocs.findFirst({
      where: eq(knowledgeDocs.filename, filename),
    });
  }

  async create(data: CreateKnowledgeDocInput) {
    const now = new Date().toISOString();
    const [created] = await db
      .insert(knowledgeDocs)
      .values({
        id: createId(),
        filename: data.filename,
        content: data.content,
        indexed: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateKnowledgeDocInput) {
    const [updated] = await db
      .update(knowledgeDocs)
      .set({
        ...data,
        indexed: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(knowledgeDocs.id, id))
      .returning();
    if (!updated) throw new Error('Knowledge doc not found');
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, id)).returning();
    return deleted;
  }

  async markIndexed(id: string) {
    const [updated] = await db
      .update(knowledgeDocs)
      .set({ indexed: true, updatedAt: new Date().toISOString() })
      .where(eq(knowledgeDocs.id, id))
      .returning();
    if (!updated) throw new Error('Knowledge doc not found');
    return updated;
  }

  async getAllForExport() {
    return db
      .select({
        id: knowledgeDocs.id,
        filename: knowledgeDocs.filename,
        content: knowledgeDocs.content,
      })
      .from(knowledgeDocs);
  }
}

export const knowledgeDocsService = new KnowledgeDocsService();
