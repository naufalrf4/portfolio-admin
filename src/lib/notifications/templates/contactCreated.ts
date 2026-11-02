import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatDateTime } from '@/lib/utils/date';

export const contactCreatedPayloadSchema = z.object({
  name: z.string(),
  email: z.string(),
  subject: z.string().nullable().optional(),
  message: z.string(),
  createdAt: z.string(),
});

export type ContactCreatedPayload = z.infer<typeof contactCreatedPayloadSchema>;

export function renderContactCreated(payload: ContactCreatedPayload): string {
  return [
    '<b>New contact message</b>',
    `From: ${escapeHtml(payload.name)} (${escapeHtml(payload.email)})`,
    `Subject: ${escapeHtml(payload.subject ?? 'General inquiry')}`,
    `Received: ${escapeHtml(formatDateTime(payload.createdAt))}`,
    '',
    escapeHtml(payload.message),
  ].join('\n');
}
