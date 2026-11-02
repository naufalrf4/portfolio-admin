import { z } from 'zod';

export const updateContactSettingsSchema = z.object({
  notificationEmail: z.string().email().nullable().optional(),
  blockedKeywords: z.array(z.string()).optional(),
});

export type UpdateContactSettingsInput = z.infer<typeof updateContactSettingsSchema>;
