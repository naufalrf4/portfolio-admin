import { z } from 'zod';

const assetValueSchema = z.string().min(1);

export const createAchievementSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
  monthYear: z.string().min(1).max(50),
  photos: z.array(assetValueSchema).default([]),
  description: z.string().min(1),
  externalUrl: z.string().url().optional().or(z.literal('')).nullable(),
  order: z.coerce.number().int().default(0),
  visible: z.boolean().default(true),
});

export const updateAchievementSchema = createAchievementSchema.partial();

export const achievementQuerySchema = z.object({
  visible: z.coerce.boolean().optional(),
});

export const reorderAchievementsSchema = z.object({
  achievementIds: z.array(z.string()),
});

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
export type AchievementQueryInput = z.infer<typeof achievementQuerySchema>;
export type ReorderAchievementsInput = z.infer<typeof reorderAchievementsSchema>;
