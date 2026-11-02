import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z
    .object({
      model: z.string().optional(),
      provider: z.string().optional(),
      tokens: z.number().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

export const createChatLogSchema = z.object({
  sessionId: z.string().min(1),
  messages: z.array(chatMessageSchema),
  mode: z.enum(['replace', 'append']).default('replace'),
});

export const chatLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateChatLogInput = z.infer<typeof createChatLogSchema>;
export type ChatLogQueryInput = z.infer<typeof chatLogQuerySchema>;
