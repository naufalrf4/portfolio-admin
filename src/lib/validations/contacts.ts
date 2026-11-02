import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(10).max(5000),
});

export const updateContactSchema = z.object({
  read: z.boolean().optional(),
  replied: z.boolean().optional(),
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().cuid()),
  action: z.enum(['markRead', 'markUnread', 'delete']),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
