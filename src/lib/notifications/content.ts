import { bookingCreatedPayloadSchema } from './templates/bookingCreated';
import { bookingStatusChangedPayloadSchema } from './templates/bookingStatusChanged';
import { contactCreatedPayloadSchema } from './templates/contactCreated';
import { guestbookCreatedPayloadSchema } from './templates/guestbookCreated';
import { logErrorPayloadSchema } from './templates/logError';
import { messageCreatedPayloadSchema } from './templates/messageCreated';
import type { NotificationEventType } from './templates';
import { formatJakartaDateKeyLabel } from '@/lib/utils/date';

export type NotificationLevel = 'info' | 'warn' | 'error';

export type NotificationContent = {
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly level: NotificationLevel;
};

const PREVIEW_LIMIT = 180;

function preview(value: string): string {
  const collapsed = value.replace(/\s+/g, ' ').trim();
  return collapsed.length > PREVIEW_LIMIT
    ? `${collapsed.slice(0, PREVIEW_LIMIT - 1)}…`
    : collapsed;
}

export function buildNotificationContent(
  eventType: NotificationEventType,
  payload: unknown
): NotificationContent {
  switch (eventType) {
    case 'contact.created': {
      const data = contactCreatedPayloadSchema.parse(payload);
      return {
        title: `New contact from ${data.name}`,
        body: preview(`${data.subject ?? 'General inquiry'} — ${data.message}`),
        link: '/contacts?tab=submissions',
        level: 'info',
      };
    }
    case 'booking.created': {
      const data = bookingCreatedPayloadSchema.parse(payload);
      return {
        title: `New booking request from ${data.name}`,
        body: preview(
          `${formatJakartaDateKeyLabel(data.date)} at ${data.time} WIB${data.notes ? ` — ${data.notes}` : ''}`
        ),
        link: '/contacts?tab=bookings',
        level: 'info',
      };
    }
    case 'booking.status_changed': {
      const data = bookingStatusChangedPayloadSchema.parse(payload);
      return {
        title: `Booking ${data.status}: ${data.name}`,
        body: preview(
          `${data.previousStatus} → ${data.status} for ${formatJakartaDateKeyLabel(data.date)} at ${data.time} WIB`
        ),
        link: '/contacts?tab=bookings',
        level: 'info',
      };
    }
    case 'message.created': {
      const data = messageCreatedPayloadSchema.parse(payload);
      return {
        title: 'New anonymous message',
        body: preview(data.content),
        link: '/contacts?tab=messages',
        level: 'info',
      };
    }
    case 'guestbook.created': {
      const data = guestbookCreatedPayloadSchema.parse(payload);
      return {
        title: `New guestbook entry from ${data.name}`,
        body: preview(data.message),
        link: '/contacts?tab=guestbook',
        level: 'info',
      };
    }
    case 'log.error': {
      const data = logErrorPayloadSchema.parse(payload);
      return {
        title:
          data.count === 1
            ? `${data.highestSeverity} in ${data.service}`
            : `${data.count} ${data.highestSeverity} entries in ${data.service}`,
        body: preview(data.summary),
        link: '/logs',
        level: data.highestSeverity === 'error' ? 'error' : 'warn',
      };
    }
  }
}
