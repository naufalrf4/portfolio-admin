import { z } from 'zod';
import { bookingCreatedPayloadSchema, renderBookingCreated } from './bookingCreated';
import {
  bookingStatusChangedPayloadSchema,
  renderBookingStatusChanged,
} from './bookingStatusChanged';
import { contactCreatedPayloadSchema, renderContactCreated } from './contactCreated';
import { guestbookCreatedPayloadSchema, renderGuestbookCreated } from './guestbookCreated';
import { logErrorPayloadSchema, renderLogError } from './logError';
import { messageCreatedPayloadSchema, renderMessageCreated } from './messageCreated';

export const notificationEventTypeSchema = z.enum([
  'contact.created',
  'booking.created',
  'booking.status_changed',
  'message.created',
  'guestbook.created',
  'log.error',
]);

export type NotificationEventType = z.infer<typeof notificationEventTypeSchema>;

export function renderNotification(eventType: NotificationEventType, payload: unknown): string {
  switch (eventType) {
    case 'contact.created':
      return renderContactCreated(contactCreatedPayloadSchema.parse(payload));
    case 'booking.created':
      return renderBookingCreated(bookingCreatedPayloadSchema.parse(payload));
    case 'booking.status_changed':
      return renderBookingStatusChanged(bookingStatusChangedPayloadSchema.parse(payload));
    case 'message.created':
      return renderMessageCreated(messageCreatedPayloadSchema.parse(payload));
    case 'guestbook.created':
      return renderGuestbookCreated(guestbookCreatedPayloadSchema.parse(payload));
    case 'log.error':
      return renderLogError(logErrorPayloadSchema.parse(payload));
  }
}

export function getLogErrorLevel(payload: unknown): z.infer<typeof logErrorPayloadSchema>['highestSeverity'] {
  return logErrorPayloadSchema.parse(payload).highestSeverity;
}
