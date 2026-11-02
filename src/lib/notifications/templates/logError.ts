import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatDateTime } from '@/lib/utils/date';

export const logErrorPayloadSchema = z.object({
  count: z.number().int().positive(),
  highestSeverity: z.enum(['debug', 'info', 'warn', 'error']),
  service: z.string(),
  summary: z.string(),
  timestamp: z.string(),
});

export type LogErrorPayload = z.infer<typeof logErrorPayloadSchema>;

export function renderLogError(payload: LogErrorPayload): string {
  return [
    '<b>Log escalation</b>',
    `Count: ${payload.count}`,
    `Highest severity: ${escapeHtml(payload.highestSeverity)}`,
    `Service: ${escapeHtml(payload.service)}`,
    `Time: ${escapeHtml(formatDateTime(payload.timestamp))}`,
    '',
    escapeHtml(payload.summary),
  ].join('\n');
}
