import { z } from 'zod';

export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

export const logServiceSchema = z.enum([
  'admin',
  'public-astro',
  'links-astro',
  'ngl-svelte',
  'rag-service',
]);

export const updateLogSettingsSchema = z.object({
  minLevel: logLevelSchema.optional(),
  enabled: z.boolean().optional(),
  serviceOverrides: z.partialRecord(logServiceSchema, logLevelSchema).optional(),
  retentionDays: z
    .object({
      debug: z.number().int().min(1).max(3650),
      info: z.number().int().min(1).max(3650),
      warn: z.number().int().min(1).max(3650),
      error: z.number().int().min(1).max(3650),
    })
    .optional(),
});

export type UpdateLogSettingsInput = z.infer<typeof updateLogSettingsSchema>;
