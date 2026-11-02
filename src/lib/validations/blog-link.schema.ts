import { z } from 'zod';

export const createBlogLinkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(500),
  description: z.string().optional().or(z.literal('')).nullable(),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  source: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().optional().or(z.literal('')),
});

export const updateBlogLinkSchema = createBlogLinkSchema.partial();

export const reorderBlogLinksSchema = z.object({
  blogIds: z.array(z.string()),
});

export type CreateBlogLinkInput = z.infer<typeof createBlogLinkSchema>;
export type UpdateBlogLinkInput = z.infer<typeof updateBlogLinkSchema>;
export type ReorderBlogLinksInput = z.infer<typeof reorderBlogLinksSchema>;
