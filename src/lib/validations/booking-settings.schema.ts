import { z } from 'zod';

export const updateBookingSettingsSchema = z.object({
  notificationEmail: z.string().email().nullable().optional().or(z.literal('')),
  reminderEnabled: z.boolean().optional(),
  reminderDay: z.number().int().min(0).max(6).optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  timezone: z
    .string()
    .refine(
      (tz) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid timezone' }
    )
    .optional(),
  googleCalendarCalendarId: z.string().nullable().optional().or(z.literal('')),
  googleCalendarCalendarName: z.string().nullable().optional().or(z.literal('')),
});

export type UpdateBookingSettingsInput = z.infer<typeof updateBookingSettingsSchema>;
