import { db } from '@/lib/db';
import { bookingSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UpdateBookingSettingsInput } from '@/lib/validations/booking-settings.schema';
import { createId } from '@paralleldrive/cuid2';

const DEFAULT_SETTINGS = {
  notificationEmail: null,
  reminderEnabled: true,
  reminderDay: 6,
  reminderTime: '09:00',
  timezone: 'Asia/Jakarta',
  googleCalendarRefreshToken: null,
  googleCalendarCalendarId: null,
  googleCalendarCalendarName: null,
  googleCalendarConnectedEmail: null,
  googleCalendarGrantedScopes: [] as string[],
  googleCalendarConnectedAt: null,
} as const;

type BookingSettingsRecord = typeof bookingSettings.$inferSelect;

type BookingSettingsUpdate = Partial<
  Pick<
    typeof bookingSettings.$inferInsert,
    | 'notificationEmail'
    | 'reminderEnabled'
    | 'reminderDay'
    | 'reminderTime'
    | 'timezone'
    | 'googleCalendarRefreshToken'
    | 'googleCalendarCalendarId'
    | 'googleCalendarCalendarName'
    | 'googleCalendarConnectedEmail'
    | 'googleCalendarGrantedScopes'
    | 'googleCalendarConnectedAt'
    | 'updatedAt'
  >
>;

function sanitizeBookingSettings(settings: BookingSettingsRecord) {
  return {
    ...settings,
    googleCalendarRefreshToken: undefined,
    googleCalendarGrantedScopes: settings.googleCalendarGrantedScopes ?? [],
    googleCalendarConnected: Boolean(
      settings.googleCalendarRefreshToken && settings.googleCalendarCalendarId
    ),
  };
}

function normalizeNullableText(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export class BookingSettingsService {
  async get() {
    const settings = await this.getInternal();

    return sanitizeBookingSettings(settings);
  }

  async getInternal() {
    const result = await db.select().from(bookingSettings).limit(1);
    let settings = result[0];

    if (!settings) {
      settings = await this.create();
    }

    return settings;
  }

  async update(data: UpdateBookingSettingsInput) {
    const updated = await this.updateInternal({
      ...data,
      googleCalendarCalendarId: normalizeNullableText(data.googleCalendarCalendarId),
      googleCalendarCalendarName: normalizeNullableText(data.googleCalendarCalendarName),
    });

    return sanitizeBookingSettings(updated);
  }

  async updateInternal(data: BookingSettingsUpdate) {
    const existing = await db.select().from(bookingSettings).limit(1);

    if (!existing[0]) {
      return this.create(data);
    }

    const updateData: BookingSettingsUpdate = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(bookingSettings)
      .set(updateData)
      .where(eq(bookingSettings.id, existing[0].id))
      .returning();
    return updated;
  }

  private async create(data?: BookingSettingsUpdate) {
    const now = new Date().toISOString();
    const [created] = await db
      .insert(bookingSettings)
      .values({
        id: createId(),
        notificationEmail: data?.notificationEmail ?? DEFAULT_SETTINGS.notificationEmail,
        reminderEnabled: data?.reminderEnabled ?? DEFAULT_SETTINGS.reminderEnabled,
        reminderDay: data?.reminderDay ?? DEFAULT_SETTINGS.reminderDay,
        reminderTime: data?.reminderTime ?? DEFAULT_SETTINGS.reminderTime,
        timezone: data?.timezone ?? DEFAULT_SETTINGS.timezone,
        googleCalendarRefreshToken:
          data?.googleCalendarRefreshToken ?? DEFAULT_SETTINGS.googleCalendarRefreshToken,
        googleCalendarCalendarId:
          data?.googleCalendarCalendarId ?? DEFAULT_SETTINGS.googleCalendarCalendarId,
        googleCalendarCalendarName:
          data?.googleCalendarCalendarName ?? DEFAULT_SETTINGS.googleCalendarCalendarName,
        googleCalendarConnectedEmail:
          data?.googleCalendarConnectedEmail ?? DEFAULT_SETTINGS.googleCalendarConnectedEmail,
        googleCalendarGrantedScopes:
          data?.googleCalendarGrantedScopes ?? DEFAULT_SETTINGS.googleCalendarGrantedScopes,
        googleCalendarConnectedAt:
          data?.googleCalendarConnectedAt ?? DEFAULT_SETTINGS.googleCalendarConnectedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }
}

export const bookingSettingsService = new BookingSettingsService();
