import { db } from '@/lib/db';
import { contactSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UpdateContactSettingsInput } from '@/lib/validations/contact-settings.schema';
import { createId } from '@paralleldrive/cuid2';

export class ContactSettingsService {
  async get() {
    const result = await db.select().from(contactSettings).limit(1);
    let settings = result[0];

    if (!settings) {
      const [created] = await db
        .insert(contactSettings)
        .values({
          id: createId(),
          updatedAt: new Date().toISOString(),
          notificationEmail: null,
          blockedKeywords: [],
        })
        .returning();
      settings = created;
    }

    return settings;
  }

  async update(data: UpdateContactSettingsInput) {
    const settings = await this.get();

    const [updated] = await db
      .update(contactSettings)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contactSettings.id, settings.id))
      .returning();
    return updated;
  }
}

export const contactSettingsService = new ContactSettingsService();
