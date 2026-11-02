import { z } from 'zod';

export const createKnowledgeDocSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255),
  content: z.string().min(1, 'Content is required'),
});

export const updateKnowledgeDocSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
});

export const knowledgeDocQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  indexed: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type CreateKnowledgeDocInput = z.infer<typeof createKnowledgeDocSchema>;
export type UpdateKnowledgeDocInput = z.infer<typeof updateKnowledgeDocSchema>;
export type KnowledgeDocQueryInput = z.infer<typeof knowledgeDocQuerySchema>;
