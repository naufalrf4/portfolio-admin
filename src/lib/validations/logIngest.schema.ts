import { z } from 'zod';
import { logLevelSchema, logServiceSchema } from './log-settings.schema';

export const logEntrySchema = z.object({
  timestamp: z.iso.datetime(),
  level: logLevelSchema,
  service: logServiceSchema,
  message: z.string().min(1).max(4000),
  context: z.record(z.string(), z.unknown()).optional(),
  errorName: z.string().max(256).optional(),
  errorMessage: z.string().max(2000).optional(),
  errorStack: z.string().max(8000).optional(),
  correlationId: z.string().max(128).optional(),
  durationMs: z.number().int().nonnegative().optional(),
  route: z.string().max(512).optional(),
  statusCode: z.number().int().optional(),
});

export const logIngestSchema = z.object({
  entries: z.array(logEntrySchema).min(1).max(100),
});

export const logIngestEnvelopeSchema = z.object({
  entries: z.array(z.unknown()).min(1).max(100),
});

export type LogIngestInput = z.infer<typeof logIngestSchema>;
