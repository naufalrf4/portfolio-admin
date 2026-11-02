import { z } from 'zod';

export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

export type TelegramSendResult =
  | { readonly ok: true; readonly messageId: number }
  | {
      readonly ok: false;
      readonly status: number;
      readonly description: string;
      readonly retryAfter?: number;
    };

const telegramSuccessSchema = z.object({
  ok: z.literal(true),
  result: z.object({ message_id: z.number().int() }),
});

const telegramErrorSchema = z.object({
  ok: z.literal(false),
  description: z.string(),
  parameters: z.object({ retry_after: z.number().int().positive() }).optional(),
});

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function sendMessage({
  chatId,
  messageThreadId,
  text,
}: {
  readonly chatId: string;
  readonly messageThreadId?: number | null;
  readonly text: string;
}): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, status: 0, description: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      ...(messageThreadId !== null && messageThreadId !== undefined
        ? { message_thread_id: messageThreadId }
        : {}),
      text: text.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH),
      parse_mode: 'HTML',
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const body: unknown = await response.json();
  if (response.ok) {
    const parsed = telegramSuccessSchema.parse(body);
    return { ok: true, messageId: parsed.result.message_id };
  }

  const parsed = telegramErrorSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: response.status, description: response.statusText };
  }

  const retryAfter = parsed.data.parameters?.retry_after;
  return {
    ok: false,
    status: response.status,
    description: parsed.data.description,
    ...(retryAfter !== undefined ? { retryAfter } : {}),
  };
}

export type TelegramChatType = 'private' | 'group' | 'supergroup' | 'channel';

export interface TelegramDiscoveredChat {
  readonly chatId: string;
  readonly title: string;
  readonly type: TelegramChatType;
  readonly messageThreadId: number | null;
  readonly threadName: string | null;
}

export type TelegramChatsResult =
  | { readonly ok: true; readonly chats: readonly TelegramDiscoveredChat[] }
  | { readonly ok: false; readonly status: number; readonly description: string };

const telegramChatSchema = z.object({
  id: z.number(),
  type: z.enum(['private', 'group', 'supergroup', 'channel']),
  title: z.string().optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
});

const telegramMessageSchema = z.object({
  chat: telegramChatSchema,
  message_thread_id: z.number().int().optional(),
  is_topic_message: z.boolean().optional(),
  reply_to_message: z
    .object({
      forum_topic_created: z.object({ name: z.string() }).optional(),
    })
    .optional(),
});

const telegramUpdatesSchema = z.object({
  ok: z.literal(true),
  result: z.array(
    z.object({
      message: telegramMessageSchema.optional(),
      channel_post: telegramMessageSchema.optional(),
      my_chat_member: z.object({ chat: telegramChatSchema }).optional(),
    })
  ),
});

function resolveChatTitle(chat: z.infer<typeof telegramChatSchema>): string {
  if (chat.title) return chat.title;
  if (chat.username) return `@${chat.username}`;
  if (chat.first_name) return chat.first_name;
  return String(chat.id);
}

export async function listAvailableChats(): Promise<TelegramChatsResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, status: 0, description: 'TELEGRAM_BOT_TOKEN is not configured' };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`, {
    signal: AbortSignal.timeout(10_000),
  });

  const body: unknown = await response.json();

  if (!response.ok) {
    const parsed = telegramErrorSchema.safeParse(body);
    return {
      ok: false,
      status: response.status,
      description: parsed.success ? parsed.data.description : response.statusText,
    };
  }

  const parsed = telegramUpdatesSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: response.status, description: 'Unexpected getUpdates response' };
  }

  const discovered = new Map<string, TelegramDiscoveredChat>();

  for (const update of parsed.data.result) {
    const message = update.message ?? update.channel_post;
    const chat = message?.chat ?? update.my_chat_member?.chat;
    if (!chat) continue;

    const messageThreadId =
      message?.is_topic_message && message.message_thread_id !== undefined
        ? message.message_thread_id
        : null;
    const key = `${chat.id}:${messageThreadId ?? 'root'}`;

    if (!discovered.has(key)) {
      discovered.set(key, {
        chatId: String(chat.id),
        title: resolveChatTitle(chat),
        type: chat.type,
        messageThreadId,
        threadName: message?.reply_to_message?.forum_topic_created?.name ?? null,
      });
    }
  }

  return { ok: true, chats: Array.from(discovered.values()) };
}
