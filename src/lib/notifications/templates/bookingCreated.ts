import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatJakartaDateKeyLabel } from '@/lib/utils/date';

export const bookingCreatedPayloadSchema = z.object({
  name: z.string(),
  email: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().nullable().optional(),
});

export type BookingCreatedPayload = z.infer<typeof bookingCreatedPayloadSchema>;

export function renderBookingCreated(payload: BookingCreatedPayload): string {
  return [
    '<b>New booking request</b>',
    `From: ${escapeHtml(payload.name)} (${escapeHtml(payload.email)})`,
    `Schedule: ${escapeHtml(formatJakartaDateKeyLabel(payload.date))}, ${escapeHtml(payload.time)} WIB`,
    ...(payload.notes ? ['', escapeHtml(payload.notes)] : []),
  ].join('\n');
}
