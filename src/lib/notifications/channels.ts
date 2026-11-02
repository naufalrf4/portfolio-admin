import { z } from 'zod';

export const notificationChannelSchema = z.enum(['inapp', 'telegram', 'webpush']);

export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

// In-app is unconditional and push is its device-level mirror, so neither is a
// per-event preference. Telegram is the only channel an admin filters per event.
export const PREFERENCE_CHANNELS = ['telegram'] as const;

export type PreferenceChannel = (typeof PREFERENCE_CHANNELS)[number];

export const preferenceChannelSchema = z.enum(PREFERENCE_CHANNELS);

// Channels an outbox row can target. In-app needs no delivery attempt.
export const DELIVERY_CHANNELS = ['telegram', 'webpush'] as const;

export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  inapp: 'In-app',
  telegram: 'Telegram',
  webpush: 'Push',
};
