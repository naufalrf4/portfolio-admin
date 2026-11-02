import { describe, expect, it } from 'bun:test';
import {
  NotificationDispatchService,
  dispatchPendingNotifications,
  type ClaimedNotification,
  type NotificationDispatchDatabase,
} from '@/lib/services/notificationDispatch.service';

function notification(overrides: Partial<ClaimedNotification> = {}): ClaimedNotification {
  return {
    id: 'outbox-1',
    channel: 'telegram',
    attempts: 0,
    chatId: '-100123',
    messageThreadId: null,
    text: 'Hello',
    subscriptionId: null,
    endpoint: null,
    p256dh: null,
    auth: null,
    title: null,
    body: null,
    link: null,
    tag: null,
    ...overrides,
  };
}

function pushNotification(overrides: Partial<ClaimedNotification> = {}): ClaimedNotification {
  return notification({
    id: 'outbox-push-1',
    channel: 'webpush',
    chatId: null,
    text: null,
    subscriptionId: 'sub-1',
    endpoint: 'https://push.example.com/abc',
    p256dh: 'key',
    auth: 'auth',
    title: 'New contact',
    body: 'Someone reached out',
    link: '/contacts?tab=submissions',
    tag: 'notif-1',
    ...overrides,
  });
}

function createHarness(rows: readonly ClaimedNotification[]) {
  const sent: { readonly id: string; readonly messageId: number | null }[] = [];
  const failures: {
    readonly id: string;
    readonly attempts: number;
    readonly status: 'failed' | 'dead';
    readonly error: string;
  }[] = [];
  const deferred: { readonly id: string; readonly retryAfter: number }[] = [];
  const droppedSubscriptions: string[] = [];
  const database: NotificationDispatchDatabase = {
    withClaimedPending: async (limit, handler) =>
      handler(rows.slice(0, limit), {
        markSent: async (id, messageId) => {
          sent.push({ id, messageId });
        },
        markFailed: async (id, attempts, status, error) => {
          failures.push({ id, attempts, status, error });
        },
        defer: async (id, retryAfter) => {
          deferred.push({ id, retryAfter });
        },
        dropSubscription: async (subscriptionId) => {
          droppedSubscriptions.push(subscriptionId);
        },
      }),
  };
  return {
    service: new NotificationDispatchService(database),
    sent,
    failures,
    deferred,
    droppedSubscriptions,
  };
}

const okPush = async () => ({ ok: true }) as const;
const okTelegram = async () => ({ ok: true, messageId: 1 }) as const;

describe('NotificationDispatchService', () => {
  it('marks a successful delivery as sent with the Telegram message id', async () => {
    const harness = createHarness([notification()]);

    const result = await harness.service.dispatch({
      send: async () => ({ ok: true, messageId: 42 }),
      sendPush: okPush,
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 1, sent: 1, failed: 0, dead: 0, throttled: false });
    expect(harness.sent).toEqual([{ id: 'outbox-1', messageId: 42 }]);
  });

  it('routes a web push row through the push sender', async () => {
    const harness = createHarness([pushNotification()]);
    const pushes: unknown[] = [];

    const result = await harness.service.dispatch({
      send: async () => {
        throw new Error('Telegram must not be called for a web push row');
      },
      sendPush: async (target, message) => {
        pushes.push({ target, message });
        return { ok: true };
      },
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 1, sent: 1, failed: 0, dead: 0, throttled: false });
    expect(harness.sent).toEqual([{ id: 'outbox-push-1', messageId: null }]);
    expect(pushes).toEqual([
      {
        target: { endpoint: 'https://push.example.com/abc', p256dh: 'key', auth: 'auth' },
        message: {
          title: 'New contact',
          body: 'Someone reached out',
          link: '/contacts?tab=submissions',
          tag: 'notif-1',
        },
      },
    ]);
  });

  it('prunes a gone push subscription and records the failure', async () => {
    const harness = createHarness([pushNotification()]);

    const result = await harness.service.dispatch({
      send: okTelegram,
      sendPush: async () => ({ ok: false, gone: true, description: 'subscription expired' }),
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 1, sent: 0, failed: 1, dead: 0, throttled: false });
    expect(harness.droppedSubscriptions).toEqual(['sub-1']);
    expect(harness.failures).toEqual([
      { id: 'outbox-push-1', attempts: 1, status: 'failed', error: 'subscription expired' },
    ]);
  });

  it('keeps a push subscription when the failure is not terminal', async () => {
    const harness = createHarness([pushNotification()]);

    await harness.service.dispatch({
      send: okTelegram,
      sendPush: async () => ({ ok: false, gone: false, description: 'push service 500' }),
      sleep: async () => {},
    });

    expect(harness.droppedSubscriptions).toEqual([]);
    expect(harness.failures).toEqual([
      { id: 'outbox-push-1', attempts: 1, status: 'failed', error: 'push service 500' },
    ]);
  });

  it('fails a Telegram row whose channel was disabled after enqueue', async () => {
    const harness = createHarness([notification({ chatId: null, text: null })]);

    const result = await harness.service.dispatch({
      send: async () => {
        throw new Error('Telegram must not be called without a chat id');
      },
      sendPush: okPush,
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 1, sent: 0, failed: 1, dead: 0, throttled: false });
    expect(harness.failures).toEqual([
      {
        id: 'outbox-1',
        attempts: 1,
        status: 'failed',
        error: 'Telegram channel is disabled or missing',
      },
    ]);
  });

  it('does not space web push sends behind the Telegram rate limit', async () => {
    const harness = createHarness([
      pushNotification({ id: 'outbox-push-1' }),
      pushNotification({ id: 'outbox-push-2' }),
      pushNotification({ id: 'outbox-push-3' }),
    ]);
    const sleeps: number[] = [];

    await harness.service.dispatch({
      send: okTelegram,
      sendPush: okPush,
      sleep: async (milliseconds) => {
        sleeps.push(milliseconds);
      },
    });

    expect(harness.sent).toHaveLength(3);
    expect(sleeps).toEqual([]);
  });

  it('defers a 429 response and stops before the next queued delivery', async () => {
    const harness = createHarness([notification(), notification({ id: 'outbox-2' })]);
    let sends = 0;

    const result = await harness.service.dispatch({
      send: async () => {
        sends += 1;
        return { ok: false, status: 429, description: 'Too Many Requests', retryAfter: 17 };
      },
      sendPush: okPush,
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 2, sent: 0, failed: 0, dead: 0, throttled: true });
    expect(sends).toBe(1);
    expect(harness.deferred).toEqual([{ id: 'outbox-1', retryAfter: 17 }]);
  });

  it('increments a generic failure and makes the fifth attempt dead', async () => {
    const harness = createHarness([notification({ attempts: 4 })]);

    const result = await harness.service.dispatch({
      send: async () => ({ ok: false, status: 500, description: 'Telegram failed' }),
      sendPush: okPush,
      sleep: async () => {},
    });

    expect(result).toEqual({ claimed: 1, sent: 0, failed: 0, dead: 1, throttled: false });
    expect(harness.failures).toEqual([
      { id: 'outbox-1', attempts: 5, status: 'dead', error: 'Telegram failed' },
    ]);
  });

  it('claims no more than fifteen rows', async () => {
    const rows = Array.from({ length: 16 }, (_, index) => notification({ id: `outbox-${index}` }));
    const harness = createHarness(rows);
    const sleeps: number[] = [];

    const result = await harness.service.dispatch({
      send: okTelegram,
      sendPush: okPush,
      sleep: async (milliseconds) => {
        sleeps.push(milliseconds);
      },
    });

    expect(result).toEqual({ claimed: 15, sent: 15, failed: 0, dead: 0, throttled: false });
    expect(harness.sent).toHaveLength(15);
    expect(sleeps).toHaveLength(14);
    expect(sleeps.every((milliseconds) => milliseconds >= 1100)).toBe(true);
  });

  it('exposes the shared dispatch entrypoint', async () => {
    const harness = createHarness([notification()]);

    const result = await dispatchPendingNotifications({
      send: async () => ({ ok: true, messageId: 7 }),
      sendPush: okPush,
      sleep: async () => {},
      database: {
        withClaimedPending: async (limit, handler) =>
          handler([notification()].slice(0, limit), {
            markSent: async (id, messageId) => {
              harness.sent.push({ id, messageId });
            },
            markFailed: async () => {},
            defer: async () => {},
            dropSubscription: async () => {},
          }),
      },
    });

    expect(result).toEqual({ claimed: 1, sent: 1, failed: 0, dead: 0, throttled: false });
    expect(harness.sent).toEqual([{ id: 'outbox-1', messageId: 7 }]);
  });
});
