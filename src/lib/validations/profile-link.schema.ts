import { z } from 'zod';

export const createProfileLinkSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const updateProfileLinkSchema = createProfileLinkSchema.partial();

export const reorderProfileLinksSchema = z.object({
  linkIds: z.array(z.string()).min(1, 'At least one link ID is required'),
});

export type CreateProfileLinkInput = z.infer<typeof createProfileLinkSchema>;
export type UpdateProfileLinkInput = z.infer<typeof updateProfileLinkSchema>;
export type ReorderProfileLinksInput = z.infer<typeof reorderProfileLinksSchema>;
