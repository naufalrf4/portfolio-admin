import { z } from 'zod';

export const createAnonymousMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  ipHash: z.string().optional(),
  ipAddress: z.string().optional().nullable(),
  countryCode: z.string().max(10).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateReadStatusSchema = z.object({
  read: z.boolean(),
});

export type CreateAnonymousMessageInput = z.infer<typeof createAnonymousMessageSchema>;
export type UpdateReadStatusInput = z.infer<typeof updateReadStatusSchema>;
