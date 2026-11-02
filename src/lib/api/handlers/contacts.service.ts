import { db } from '@/lib/db';
import { eq, and, or, ilike, desc, inArray, count } from 'drizzle-orm';
import { contactForms } from '@/lib/db/schema';
import { createId } from '@paralleldrive/cuid2';
import type {
  CreateContactInput,
  UpdateContactInput,
  ContactQueryInput,
} from '@/lib/validations/contact.schema';

export class ContactsService {
  async getAll(query: ContactQueryInput) {
    const { page, limit, read, search } = query;
    const skip = (page - 1) * limit;

    const conditions = [];

    if (read !== undefined) {
      conditions.push(eq(contactForms.read, read));
    }

    if (search) {
      conditions.push(
        or(
          ilike(contactForms.name, `%${search}%`),
          ilike(contactForms.email, `%${search}%`),
          ilike(contactForms.subject, `%${search}%`),
          ilike(contactForms.message, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [contacts, [{ total }]] = await Promise.all([
      db
        .select()
        .from(contactForms)
        .where(whereClause)
        .limit(limit)
        .offset(skip)
        .orderBy(desc(contactForms.createdAt)),
      db.select({ total: count() }).from(contactForms).where(whereClause),
    ]);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const [contact] = await db.select().from(contactForms).where(eq(contactForms.id, id)).limit(1);
    return contact || null;
  }

  async create(data: CreateContactInput) {
    const now = new Date().toISOString();
    const [created] = await db
      .insert(contactForms)
      .values({
        id: createId(),
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
        ipHash: data.ipHash,
        ipAddress: data.ipAddress || null,
        countryCode: data.countryCode || null,
        country: data.country || null,
        city: data.city || null,
        region: data.region || null,
        read: false,
        replied: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateContactInput) {
    const now = new Date().toISOString();
    const [updated] = await db
      .update(contactForms)
      .set({ ...data, updatedAt: now })
      .where(eq(contactForms.id, id))
      .returning();
    if (!updated) throw new Error('Contact not found');
    return updated;
  }

  async markAsRead(id: string) {
    return this.update(id, { read: true });
  }

  async delete(id: string) {
    const [deleted] = await db.delete(contactForms).where(eq(contactForms.id, id)).returning();
    return deleted;
  }

  async bulkMarkAsRead(ids: string[]) {
    const now = new Date().toISOString();
    return db
      .update(contactForms)
      .set({ read: true, updatedAt: now })
      .where(inArray(contactForms.id, ids))
      .returning();
  }

  async bulkMarkAsUnread(ids: string[]) {
    const now = new Date().toISOString();
    return db
      .update(contactForms)
      .set({ read: false, updatedAt: now })
      .where(inArray(contactForms.id, ids))
      .returning();
  }

  async bulkDelete(ids: string[]) {
    return db.delete(contactForms).where(inArray(contactForms.id, ids)).returning();
  }
}

export const contactsService = new ContactsService();
