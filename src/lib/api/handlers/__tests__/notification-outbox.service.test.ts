import { describe, expect, it } from 'bun:test';
import {
  NotificationOutboxService,
  type NotificationOutboxDatabase,
  type NotificationOutboxRow,
} from '@/lib/api/handlers/notification-outbox.service';

const outboxRow: NotificationOutboxRow = {
  id: 'outbox-1',
  eventType: 'contact.created',
  channel: 'telegram',
  channelId: 'channel-1',
  channelName: 'Operations',
  target: null,
  status: 'dead',
  attempts: 5,
  lastError: 'Bad Request',
  telegramMessageId: null,
  createdAt: '2026-08-28T05:00:00.000Z',
  sentAt: null,
  nextAttemptAt: '2026-08-28T05:05:00.000Z',
};

function createHarness(row: NotificationOutboxRow | null = outboxRow) {
  const listInputs: Parameters<NotificationOutboxDatabase['list']>[0][] = [];
  const retryInputs: Parameters<NotificationOutboxDatabase['retry']>[0][] = [];
  const database: NotificationOutboxDatabase = {
    list: async (input) => {
      listInputs.push(input);
      return row === null ? [] : [row];
    },
    findById: async () => row ?? undefined,
    retry: async (input) => {
      retryInputs.push(input);
      return row === null ? undefined : { ...row, ...input };
    },
  };

  return { service: new NotificationOutboxService(database), listInputs, retryInputs };
}

describe('NotificationOutboxService', () => {
  it('lists recent deliveries with the requested status and limit', async () => {
    const harness = createHarness();

    const result = await harness.service.list({ status: 'dead', limit: 25 });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(outboxRow.id);
    expect(harness.listInputs).toHaveLength(1);
    expect(harness.listInputs[0]?.status).toBe('dead');
    expect(harness.listInputs[0]?.limit).toBe(25);
  });

  it('resets a dead delivery to pending without sending it', async () => {
    const harness = createHarness();

    const result = await harness.service.retry(outboxRow.id);

    expect(result.ok).toBe(true);
    expect(harness.retryInputs).toHaveLength(1);
    expect(harness.retryInputs[0]?.id).toBe(outboxRow.id);
    expect(harness.retryInputs[0]?.status).toBe('pending');
    expect(harness.retryInputs[0]?.attempts).toBe(0);
    expect(harness.retryInputs[0]?.nextAttemptAt).toBeString();
    expect(harness.retryInputs[0]?.lastError).toBeNull();
  });

  it('refuses retry for a pending delivery', async () => {
    const harness = createHarness({ ...outboxRow, status: 'pending' });

    const result = await harness.service.retry(outboxRow.id);

    expect(result).toEqual({
      ok: false,
      code: 'not_retryable',
      message: 'Only failed or dead notifications can be retried',
    });
    expect(harness.retryInputs).toHaveLength(0);
  });

  it('reports a missing delivery', async () => {
    const harness = createHarness(null);

    const result = await harness.service.retry('missing');

    expect(result).toEqual({ ok: false, code: 'not_found' });
  });
});
