import { describe, expect, it } from 'bun:test';
import {
  NotificationChannelsService,
  type NotificationChannelsDatabase,
} from '@/lib/api/handlers/notification-channels.service';

const channel = {
  id: 'channel-1',
  name: 'Operations',
  chatId: '-1001234567890',
  messageThreadId: 42,
  enabled: true,
  createdAt: '2026-08-28T05:00:00.000Z',
  updatedAt: '2026-08-28T05:00:00.000Z',
};

function createHarness(pendingDeliveries = 0) {
  const createdInputs: Parameters<NotificationChannelsDatabase['create']>[0][] = [];
  const updatedInputs: Parameters<NotificationChannelsDatabase['update']>[1][] = [];
  const removedIds: string[] = [];
  const database: NotificationChannelsDatabase = {
    list: async () => [channel],
    findById: async (id) => (id === channel.id ? channel : undefined),
    create: async (input) => {
      createdInputs.push(input);
      return { ...channel, ...input };
    },
    update: async (_id, input) => {
      updatedInputs.push(input);
      return { ...channel, ...input };
    },
    remove: async (id) => {
      removedIds.push(id);
      return id === channel.id ? channel : undefined;
    },
    countPendingDeliveries: async () => pendingDeliveries,
  };

  return {
    service: new NotificationChannelsService(database),
    createdInputs,
    updatedInputs,
    removedIds,
  };
}

describe('NotificationChannelsService', () => {
  it('creates a channel with an id and update timestamp', async () => {
    const harness = createHarness();

    const result = await harness.service.create({
      name: 'Operations',
      chatId: '-1001234567890',
      messageThreadId: 42,
      enabled: true,
    });

    expect(result.id).toBeString();
    expect(harness.createdInputs).toHaveLength(1);
    expect(harness.createdInputs[0]?.updatedAt).toBeString();
  });

  it('updates only supplied channel fields with a fresh timestamp', async () => {
    const harness = createHarness();

    const result = await harness.service.update(channel.id, { enabled: false });

    expect(result?.enabled).toBe(false);
    expect(harness.updatedInputs).toHaveLength(1);
    expect(harness.updatedInputs[0]?.enabled).toBe(false);
    expect(harness.updatedInputs[0]?.updatedAt).toBeString();
  });

  it('blocks removal while deliveries are still queued for the channel', async () => {
    const harness = createHarness(2);

    const result = await harness.service.remove(channel.id);

    expect(result).toEqual({
      ok: false,
      code: 'channel_in_use',
      message: 'Channel still has undelivered notifications queued',
    });
    expect(harness.removedIds).toHaveLength(0);
  });

  it('removes an unreferenced channel', async () => {
    const harness = createHarness();

    const result = await harness.service.remove(channel.id);

    expect(result).toEqual({ ok: true, channel });
    expect(harness.removedIds).toEqual([channel.id]);
  });
});
