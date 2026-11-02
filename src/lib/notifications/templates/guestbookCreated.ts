import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatDateTime } from '@/lib/utils/date';

export const guestbookCreatedPayloadSchema = z.object({
  name: z.string(),
  message: z.string(),
  createdAt: z.string(),
});

export type GuestbookCreatedPayload = z.infer<typeof guestbookCreatedPayloadSchema>;

export function renderGuestbookCreated(payload: GuestbookCreatedPayload): string {
  return [
    '<b>New guestbook entry</b>',
    `From: ${escapeHtml(payload.name)}`,
    `Received: ${escapeHtml(formatDateTime(payload.createdAt))}`,
    '',
    escapeHtml(payload.message),
  ].join('\n');
}
