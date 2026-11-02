import { describe, expect, it } from 'bun:test';
import type { LogEntryInput } from '@naufalrf/contracts';
import { LogEscalationService } from '@/lib/services/logEscalation.service';
import type { NotificationService } from '@/lib/services/notificationService';

const timestamp = '2026-08-28T05:00:00.000Z';

function entry(overrides: Partial<LogEntryInput> = {}): LogEntryInput {
  return {
    timestamp,
    level: 'error',
    service: 'admin',
    message: 'Something broke',
    ...overrides,
  };
}

function createHarness() {
  const enqueued: { readonly eventType: string; readonly payload: unknown }[] = [];
  const notifications = {
    enqueue: async (eventType: string, payload: unknown) => {
      enqueued.push({ eventType, payload });
      return { notificationId: 'notif-1', enqueued: 1 };
    },
  } as unknown as NotificationService;

  return { service: new LogEscalationService(notifications), enqueued };
}

describe('LogEscalationService', () => {
  it('escalates warn and error entries', async () => {
    const harness = createHarness();

    const count = await harness.service.escalate([entry({ level: 'warn' }), entry()]);

    expect(count).toBe(1);
    expect(harness.enqueued).toHaveLength(1);
    expect(harness.enqueued[0]?.eventType).toBe('log.error');
  });

  it('ignores debug and info entries', async () => {
    const harness = createHarness();

    const count = await harness.service.escalate([
      entry({ level: 'debug' }),
      entry({ level: 'info' }),
    ]);

    expect(count).toBe(0);
    expect(harness.enqueued).toHaveLength(0);
  });

  it('groups a burst per service into one notification each', async () => {
    const harness = createHarness();

    const count = await harness.service.escalate([
      entry({ service: 'admin' }),
      entry({ service: 'admin' }),
      entry({ service: 'rag-service' }),
    ]);

    expect(count).toBe(2);
    expect(harness.enqueued).toHaveLength(2);

    const services = harness.enqueued.map(
      (item) => (item.payload as { readonly service: string }).service
    );
    expect(services.sort()).toEqual(['admin', 'rag-service']);
  });

  it('reports the highest severity and the batch count', async () => {
    const harness = createHarness();

    await harness.service.escalate([
      entry({ level: 'warn' }),
      entry({ level: 'error' }),
      entry({ level: 'warn' }),
    ]);

    expect(harness.enqueued[0]?.payload).toMatchObject({
      count: 3,
      highestSeverity: 'error',
      service: 'admin',
    });
  });

  it('keeps warn as the highest severity when no error is present', async () => {
    const harness = createHarness();

    await harness.service.escalate([entry({ level: 'warn' }), entry({ level: 'warn' })]);

    expect(harness.enqueued[0]?.payload).toMatchObject({ count: 2, highestSeverity: 'warn' });
  });

  it('never escalates the notification subsystem own failures', async () => {
    const harness = createHarness();

    const count = await harness.service.escalate([
      entry({ message: 'Notification fan-out failed', context: { operation: 'notification.enqueue' } }),
      entry({ message: 'dispatch died', context: { operation: 'notification.dispatch' } }),
    ]);

    expect(count).toBe(0);
    expect(harness.enqueued).toHaveLength(0);
  });

  it('still escalates unrelated operations that carry a context', async () => {
    const harness = createHarness();

    const count = await harness.service.escalate([
      entry({ context: { operation: 'contact.create' } }),
    ]);

    expect(count).toBe(1);
  });

  it('uses the newest timestamp in the group', async () => {
    const harness = createHarness();

    await harness.service.escalate([
      entry({ timestamp: '2026-08-28T05:00:00.000Z' }),
      entry({ timestamp: '2026-08-28T06:30:00.000Z' }),
    ]);

    expect(harness.enqueued[0]?.payload).toMatchObject({
      timestamp: '2026-08-28T06:30:00.000Z',
    });
  });

  it('includes the error message in the summary', async () => {
    const harness = createHarness();

    await harness.service.escalate([
      entry({ message: 'Query failed', errorMessage: 'connection refused' }),
    ]);

    const summary = (harness.enqueued[0]?.payload as { readonly summary: string }).summary;
    expect(summary).toBe('[error] Query failed — connection refused');
  });

  it('truncates an oversized summary', async () => {
    const harness = createHarness();
    const entries = Array.from({ length: 40 }, (_, index) =>
      entry({ message: `failure number ${index} with a fairly long description` })
    );

    await harness.service.escalate(entries);

    const summary = (harness.enqueued[0]?.payload as { readonly summary: string }).summary;
    expect(summary.length).toBeLessThanOrEqual(400);
    expect(summary.endsWith('…')).toBe(true);
  });
});
