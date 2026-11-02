import { z } from 'zod';
import { logLevelSchema, logServiceSchema } from '@/lib/validations/log-settings.schema';

export const logQuerySchema = z.object({
  level: logLevelSchema.optional(),
  service: logServiceSchema.optional(),
  message: z.string().min(1).max(200).optional(),
  correlationId: z.string().min(1).max(128).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LogQueryInput = z.infer<typeof logQuerySchema>;
