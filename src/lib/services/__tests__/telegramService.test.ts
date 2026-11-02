import { afterEach, describe, expect, it } from 'bun:test';
import { z } from 'zod';
import {
  escapeHtml,
  listAvailableChats,
  sendMessage,
  TELEGRAM_MAX_MESSAGE_LENGTH,
} from '@/lib/services/telegramService';

const originalFetch = globalThis.fetch;
const requestBodySchema = z.object({ text: z.string() }).passthrough();

function fetchStub(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): typeof fetch {
  return Object.assign(handler, { preconnect: originalFetch.preconnect });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.TELEGRAM_BOT_TOKEN;
});

describe('telegramService', () => {
  it('returns the Telegram message id when sending succeeds', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 })
    );

    const result = await sendMessage({ chatId: '-1001', text: 'Hello' });

    expect(result).toEqual({ ok: true, messageId: 42 });
  });

  it('returns Telegram retry timing when rate limited', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(
        JSON.stringify({
          ok: false,
          description: 'Too Many Requests',
          parameters: { retry_after: 30 },
        }),
        { status: 429 }
      )
    );

    const result = await sendMessage({ chatId: '-1001', text: 'Hello' });

    expect(result).toEqual({
      ok: false,
      status: 429,
      description: 'Too Many Requests',
      retryAfter: 30,
    });
  });

  it('escapes Telegram HTML control characters', () => {
    expect(escapeHtml("<b>x</b> & 'y'")).toBe("&lt;b&gt;x&lt;/b&gt; &amp; 'y'");
  });

  it('truncates outgoing text to the Telegram limit', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    let body: unknown;
    globalThis.fetch = fetchStub(async (_input, init) => {
      body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
        status: 200,
      });
    });

    await sendMessage({ chatId: '-1001', text: 'x'.repeat(TELEGRAM_MAX_MESSAGE_LENGTH + 20) });

    const parsed = requestBodySchema.parse(body);
    expect(parsed.text).toBe('x'.repeat(TELEGRAM_MAX_MESSAGE_LENGTH));
  });

  it('omits the message thread when none is provided', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    let body: unknown;
    globalThis.fetch = fetchStub(async (_input, init) => {
      body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
        status: 200,
      });
    });

    await sendMessage({ chatId: '-1001', text: 'Hello' });

    expect(body).not.toHaveProperty('message_thread_id');
  });
});

describe('listAvailableChats', () => {
  it('reports a missing bot token instead of calling Telegram', async () => {
    const result = await listAvailableChats();

    expect(result).toEqual({
      ok: false,
      status: 0,
      description: 'TELEGRAM_BOT_TOKEN is not configured',
    });
  });

  it('collects distinct chats from group messages', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: [
            { message: { chat: { id: -1001, type: 'supergroup', title: 'Ops Room' } } },
            { message: { chat: { id: -1001, type: 'supergroup', title: 'Ops Room' } } },
            { message: { chat: { id: 555, type: 'private', first_name: 'Naufal' } } },
          ],
        }),
        { status: 200 }
      )
    );

    const result = await listAvailableChats();

    expect(result).toEqual({
      ok: true,
      chats: [
        {
          chatId: '-1001',
          title: 'Ops Room',
          type: 'supergroup',
          messageThreadId: null,
          threadName: null,
        },
        {
          chatId: '555',
          title: 'Naufal',
          type: 'private',
          messageThreadId: null,
          threadName: null,
        },
      ],
    });
  });

  it('treats forum topics as separate entries and captures the topic name', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: [
            { message: { chat: { id: -1002, type: 'supergroup', title: 'Forum' } } },
            {
              message: {
                chat: { id: -1002, type: 'supergroup', title: 'Forum' },
                message_thread_id: 77,
                is_topic_message: true,
                reply_to_message: { forum_topic_created: { name: 'Alerts' } },
              },
            },
          ],
        }),
        { status: 200 }
      )
    );

    const result = await listAvailableChats();

    expect(result).toEqual({
      ok: true,
      chats: [
        {
          chatId: '-1002',
          title: 'Forum',
          type: 'supergroup',
          messageThreadId: null,
          threadName: null,
        },
        {
          chatId: '-1002',
          title: 'Forum',
          type: 'supergroup',
          messageThreadId: 77,
          threadName: 'Alerts',
        },
      ],
    });
  });

  it('discovers chats the bot was just added to', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          result: [{ my_chat_member: { chat: { id: -1003, type: 'group', title: 'New Group' } } }],
        }),
        { status: 200 }
      )
    );

    const result = await listAvailableChats();

    expect(result).toEqual({
      ok: true,
      chats: [
        {
          chatId: '-1003',
          title: 'New Group',
          type: 'group',
          messageThreadId: null,
          threadName: null,
        },
      ],
    });
  });

  it('surfaces the Telegram description when the API rejects the request', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'bad-token';
    globalThis.fetch = fetchStub(async () =>
      new Response(JSON.stringify({ ok: false, description: 'Unauthorized' }), { status: 401 })
    );

    const result = await listAvailableChats();

    expect(result).toEqual({ ok: false, status: 401, description: 'Unauthorized' });
  });
});
