import { z } from 'zod';
import { escapeHtml } from '@/lib/services/telegramService';
import { formatJakartaDateKeyLabel } from '@/lib/utils/date';

export const bookingStatusChangedPayloadSchema = z.object({
  name: z.string(),
  previousStatus: z.string(),
  status: z.string(),
  date: z.string(),
  time: z.string(),
});

export type BookingStatusChangedPayload = z.infer<typeof bookingStatusChangedPayloadSchema>;

export function renderBookingStatusChanged(payload: BookingStatusChangedPayload): string {
  return [
    '<b>Booking status changed</b>',
    `Guest: ${escapeHtml(payload.name)}`,
    `Status: ${escapeHtml(payload.previousStatus)} → ${escapeHtml(payload.status)}`,
    `Schedule: ${escapeHtml(formatJakartaDateKeyLabel(payload.date))}, ${escapeHtml(payload.time)} WIB`,
  ].join('\n');
}
