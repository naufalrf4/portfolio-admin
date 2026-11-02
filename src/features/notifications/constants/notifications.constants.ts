import type { DeliveryChannel, NotificationLevel, OutboxStatus } from '../types/notifications.types';

export const NOTIFICATION_EVENT_TYPES = [
  {
    value: 'contact.created',
    label: 'Contact Created',
    description: 'New contact submission received',
  },
  { value: 'booking.created', label: 'Booking Created', description: 'New meeting booking created' },
  {
    value: 'booking.status_changed',
    label: 'Booking Status Changed',
    description: 'Booking approved, rejected, or rescheduled',
  },
  {
    value: 'message.created',
    label: 'NGL Message Created',
    description: 'New anonymous message submitted',
  },
  {
    value: 'guestbook.created',
    label: 'Guestbook Created',
    description: 'New guestbook entry posted',
  },
  {
    value: 'log.error',
    label: 'Application Error Log',
    description: 'Warning and error logs from any service',
  },
] as const;

export const OUTBOX_STATUS_OPTIONS: readonly { readonly value: string; readonly label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'dead', label: 'Dead' },
] as const;

export const OUTBOX_CHANNEL_OPTIONS: readonly { readonly value: string; readonly label: string }[] =
  [
    { value: 'all', label: 'All Channels' },
    { value: 'webpush', label: 'Push' },
    { value: 'telegram', label: 'Telegram' },
  ] as const;

export const OUTBOX_LIMIT_OPTIONS = [25, 50, 100, 200] as const;

export const INBOX_PAGE_SIZE = 20;

export const INBOX_SUMMARY_LIMIT = 8;

export const BELL_POLL_INTERVAL_MS = 30_000;

export const STATUS_BADGE_VARIANTS: Record<
  OutboxStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive'
> = {
  pending: 'warning',
  sent: 'success',
  failed: 'destructive',
  dead: 'destructive',
};

export const LEVEL_BADGE_VARIANTS: Record<
  NotificationLevel,
  'default' | 'primary' | 'success' | 'warning' | 'destructive'
> = {
  info: 'default',
  warn: 'warning',
  error: 'destructive',
};

export const CHANNEL_LABELS: Record<DeliveryChannel, string> = {
  telegram: 'Telegram',
  webpush: 'Push',
};

export function getEventTypeLabel(eventType: string): string {
  const match = NOTIFICATION_EVENT_TYPES.find((item) => item.value === eventType);
  return match?.label ?? eventType;
}
