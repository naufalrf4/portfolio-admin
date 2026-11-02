import { z } from 'zod';
import { preferenceChannelSchema } from '@/lib/notifications/channels';
import { notificationEventTypeSchema } from '@/lib/services/notificationService';

const channelFields = {
  name: z.string().trim().min(1).max(100),
  chatId: z.string().trim().regex(/^-?\d+$/, 'Chat ID must be an integer'),
  messageThreadId: z.number().int().positive().nullable().optional(),
  enabled: z.boolean().optional(),
};

export const createChannelSchema = z.object({
  ...channelFields,
  enabled: channelFields.enabled.default(true),
});

export const updateChannelSchema = z.object({
  name: channelFields.name.optional(),
  chatId: channelFields.chatId.optional(),
  messageThreadId: channelFields.messageThreadId,
  enabled: z.boolean().optional(),
});

export const savePreferenceSchema = z.object({
  eventType: notificationEventTypeSchema,
  channel: preferenceChannelSchema,
  enabled: z.boolean(),
});

export const outboxQuerySchema = z.object({
  status: z.enum(['pending', 'sent', 'failed', 'dead']).optional(),
  channel: z.enum(['telegram', 'webpush']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const inboxQuerySchema = z.object({
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().trim().min(1).optional(),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.url().max(2000),
  keys: z.object({
    p256dh: z.string().trim().min(1).max(500),
    auth: z.string().trim().min(1).max(500),
  }),
  label: z.string().trim().min(1).max(120).optional(),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.url().max(2000),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type SavePreferenceInput = z.infer<typeof savePreferenceSchema>;
export type OutboxQuery = z.infer<typeof outboxQuerySchema>;
export type InboxQuery = z.infer<typeof inboxQuerySchema>;
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>;
