import { describe, expect, it } from 'bun:test';
import type { LogLevel } from '@naufalrf/contracts';
import type { PreferenceChannel } from '@/lib/notifications/channels';
import type { NotificationDatabase } from '@/lib/services/notificationService';
import { NotificationService } from '@/lib/services/notificationService';

const contactPayload = {
  name: 'Visitor',
  email: 'visitor@example.com',
  subject: 'Project',
  message: 'Hello',
  createdAt: '2026-08-28T05:00:00.000Z',
};

const logPayload = (highestSeverity: LogLevel) => ({
  count: 3,
  highestSeverity,
  service: 'admin',
  summary: 'Database unavailable',
  timestamp: '2026-08-28T05:00:00.000Z',
});

type InsertedNotification = {
  readonly eventType: string;
  readonly title: string;
  readonly body: string;
  readonly link: string | null;
  readonly level: string;
};

type InsertedOutbox = {
  readonly eventType: string;
  readonly channel: string;
  readonly channelId: string | null;
  readonly subscriptionId: string | null;
  readonly payload: Record<string, unknown>;
  readonly status: string;
  readonly attempts: number;
};

function createHarness({
  preferences = [],
  channelIds = ['channel-1'],
  subscriptionIds = [],
  notificationFailure,
  fanOutFailure,
}: {
  readonly preferences?: readonly PreferenceChannel[];
  readonly channelIds?: readonly string[];
  readonly subscriptionIds?: readonly string[];
  readonly notificationFailure?: Error;
  readonly fanOutFailure?: Error;
} = {}) {
  const notifications: InsertedNotification[] = [];
  const inserted: InsertedOutbox[] = [];
  const savedPreferences: unknown[] = [];

  const database: NotificationDatabase = {
    findEnabledPreferences: async () => {
      if (fanOutFailure) {
        throw fanOutFailure;
      }
      return preferences;
    },
    insertNotification: async (record) => {
      if (notificationFailure) {
        throw notificationFailure;
      }
      notifications.push(record);
    },
    findTelegramChannelIds: async () => channelIds,
    findPushSubscriptionIds: async () => subscriptionIds,
    insertOutbox: async (records) => {
      inserted.push(...records);
    },
    savePreference: async (input) => {
      savedPreferences.push(input);
    },
  };

  return {
    service: new NotificationService(database),
    notifications,
    inserted,
    savedPreferences,
  };
}

describe('NotificationService', () => {
  it('always records an in-app notification even with every channel disabled', async () => {
    const harness = createHarness();

    const result = await harness.service.enqueue('contact.created', contactPayload);

    expect(result.notificationId).toBeString();
    expect(result.enqueued).toBe(0);
    expect(harness.notifications).toHaveLength(1);
    expect(harness.notifications[0]?.eventType).toBe('contact.created');
    expect(harness.notifications[0]?.title).toBe('New contact from Visitor');
    expect(harness.notifications[0]?.link).toBe('/contacts?tab=submissions');
    expect(harness.notifications[0]?.level).toBe('info');
    expect(harness.inserted).toHaveLength(0);
  });

  it('mirrors the notification to every registered device without a per-event toggle', async () => {
    const harness = createHarness({ subscriptionIds: ['sub-1', 'sub-2'] });

    const result = await harness.service.enqueue('contact.created', contactPayload);

    expect(result.enqueued).toBe(2);
    expect(harness.inserted).toHaveLength(2);
    expect(harness.inserted.every((record) => record.channel === 'webpush')).toBe(true);
    expect(harness.inserted.map((record) => record.subscriptionId)).toEqual(['sub-1', 'sub-2']);
    expect(harness.inserted[0]?.payload.title).toBe('New contact from Visitor');
    expect(harness.inserted[0]?.payload.tag).toBe(result.notificationId);
    expect(harness.inserted.every((record) => record.channelId === null)).toBe(true);
  });

  it('adds Telegram rows only when the event has Telegram enabled', async () => {
    const disabled = createHarness();
    const enabled = createHarness({
      preferences: ['telegram'],
      channelIds: ['channel-1', 'channel-2'],
    });

    await disabled.service.enqueue('contact.created', contactPayload);
    const result = await enabled.service.enqueue('contact.created', contactPayload);

    expect(disabled.inserted).toHaveLength(0);
    expect(result.enqueued).toBe(2);
    expect(enabled.inserted.every((record) => record.channel === 'telegram')).toBe(true);
    expect(enabled.inserted.map((record) => record.channelId)).toEqual([
      'channel-1',
      'channel-2',
    ]);
    expect(enabled.inserted[0]?.payload.text).toContain('New contact message');
  });

  it('fans out to push and Telegram together from one event', async () => {
    const harness = createHarness({
      preferences: ['telegram'],
      channelIds: ['channel-1'],
      subscriptionIds: ['sub-1'],
    });

    const result = await harness.service.enqueue('contact.created', contactPayload);

    expect(result.enqueued).toBe(2);
    expect(harness.inserted.map((record) => record.channel).sort()).toEqual([
      'telegram',
      'webpush',
    ]);
    expect(harness.notifications).toHaveLength(1);
  });

  it('marks a log error notification at error level and links to the log view', async () => {
    const harness = createHarness();

    await harness.service.enqueue('log.error', logPayload('error'));

    expect(harness.notifications[0]?.level).toBe('error');
    expect(harness.notifications[0]?.link).toBe('/logs');
    expect(harness.notifications[0]?.title).toBe('3 error entries in admin');
  });

  it('stamps every queued row as a fresh pending attempt', async () => {
    const harness = createHarness({
      preferences: ['telegram'],
      subscriptionIds: ['sub-1'],
    });

    await harness.service.enqueue('contact.created', contactPayload);

    expect(harness.inserted).toHaveLength(2);
    expect(harness.inserted.every((record) => record.status === 'pending')).toBe(true);
    expect(harness.inserted.every((record) => record.attempts === 0)).toBe(true);
  });

  it('reports no notification when an invalid payload cannot be rendered', async () => {
    const harness = createHarness();

    const result = await harness.service.enqueue('contact.created', { name: 'Visitor' });

    expect(result).toEqual({ notificationId: null, enqueued: 0 });
    expect(harness.notifications).toHaveLength(0);
  });

  it('reports no notification when the in-app insert fails', async () => {
    const harness = createHarness({ notificationFailure: new Error('database unavailable') });

    const result = await harness.service.enqueue('contact.created', contactPayload);

    expect(result).toEqual({ notificationId: null, enqueued: 0 });
    expect(harness.inserted).toHaveLength(0);
  });

  it('keeps the in-app notification when channel fan-out fails', async () => {
    const harness = createHarness({ fanOutFailure: new Error('database unavailable') });

    const result = await harness.service.enqueue('contact.created', contactPayload);

    expect(result.notificationId).toBeString();
    expect(result.enqueued).toBe(0);
    expect(harness.notifications).toHaveLength(1);
  });

  it('saves a Telegram preference toggle', async () => {
    const harness = createHarness();

    await harness.service.savePreference({
      eventType: 'contact.created',
      channel: 'telegram',
      enabled: true,
    });

    expect(harness.savedPreferences).toEqual([
      { eventType: 'contact.created', channel: 'telegram', enabled: true },
    ]);
  });
});
