import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatDateTime } from '@/lib/utils/date';

export const messageCreatedPayloadSchema = z.object({
  content: z.string(),
  createdAt: z.string(),
});

export type MessageCreatedPayload = z.infer<typeof messageCreatedPayloadSchema>;

export function renderMessageCreated(payload: MessageCreatedPayload): string {
  return [
    '<b>New anonymous message</b>',
    `Received: ${escapeHtml(formatDateTime(payload.createdAt))}`,
    '',
    escapeHtml(payload.content),
  ].join('\n');
}
