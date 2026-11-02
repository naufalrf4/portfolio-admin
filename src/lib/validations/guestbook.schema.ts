import { z } from 'zod';

export const createGuestbookEntrySchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be 500 characters or less'),
});

export type CreateGuestbookEntryInput = z.infer<typeof createGuestbookEntrySchema>;
