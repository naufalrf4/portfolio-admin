import { z } from 'zod';

const levelsField = z
  .array(z.enum(['debug', 'info', 'warn', 'error']))
  .nonempty()
  .max(4)
  .optional();

export const logClearSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('last-n-days'),
    days: z.coerce.number().int().min(1).max(3650),
    levels: levelsField,
  }),
  z.object({
    mode: z.literal('before-date'),
    beforeDate: z.iso.datetime({ offset: true }),
    levels: levelsField,
  }),
  z.object({
    mode: z.literal('all'),
    levels: levelsField,
  }),
]);

export type LogClearInput = z.infer<typeof logClearSchema>;
