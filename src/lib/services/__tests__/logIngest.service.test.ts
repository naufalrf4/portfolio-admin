import { describe, expect, it } from 'bun:test';
import type { LogCaptureSettings, LogEntryInput } from '@naufalrf/contracts';
import { appLogs } from '@/lib/db/schema';
import { LogIngestService } from '@/lib/services/logIngest.service';

type AppLogRecord = typeof appLogs.$inferInsert;

const timestamp = '2026-08-28T05:00:00.000Z';

function entry(
  level: LogEntryInput['level'],
  service: LogEntryInput['service'] = 'admin',
  message = `${service}-${level}`
): LogEntryInput {
  return { timestamp, level, service, message };
}

function settings(overrides: Partial<LogCaptureSettings> = {}): LogCaptureSettings {
  return {
    minLevel: 'info',
    enabled: true,
    serviceOverrides: {},
    retentionDays: { debug: 7, info: 30, warn: 90, error: 90 },
    ...overrides,
  };
}

function createHarness(captureSettings: LogCaptureSettings) {
  const insertedBatches: AppLogRecord[][] = [];
  let settingsCalls = 0;
  const database = {
    insert: (_table: typeof appLogs) => ({
      values: async (records: AppLogRecord[]) => {
        insertedBatches.push(records);
      },
    }),
  };
  const settingsSource = {
    getCaptureSettings: async () => {
      settingsCalls += 1;
      return captureSettings;
    },
  };

  const escalatedBatches: LogEntryInput[][] = [];
  const escalationSource = {
    escalate: async (entries: readonly LogEntryInput[]) => {
      escalatedBatches.push([...entries]);
      return entries.length;
    },
  };

  return {
    service: new LogIngestService(database, settingsSource, escalationSource),
    insertedBatches,
    escalatedBatches,
    getSettingsCalls: () => settingsCalls,
  };
}

describe('LogIngestService', () => {
  it('stores only entries meeting the global threshold', async () => {
    const harness = createHarness(settings({ minLevel: 'warn' }));

    const result = await harness.service.ingest([
      entry('debug'),
      entry('info'),
      entry('error'),
    ]);

    expect(result).toEqual({ accepted: 3, stored: 1 });
    expect(harness.insertedBatches).toHaveLength(1);
    expect(harness.insertedBatches[0]?.map((record) => record.level)).toEqual(['error']);
  });

  it('applies service overrides before the global threshold', async () => {
    const harness = createHarness(
      settings({ minLevel: 'info', serviceOverrides: { 'rag-service': 'error' } })
    );

    const result = await harness.service.ingest([
      entry('warn', 'rag-service'),
      entry('warn', 'public-astro'),
    ]);

    expect(result).toEqual({ accepted: 2, stored: 1 });
    expect(harness.insertedBatches[0]?.map((record) => record.service)).toEqual([
      'public-astro',
    ]);
  });

  it('skips insertion when capture is disabled', async () => {
    const harness = createHarness(settings({ enabled: false }));

    const result = await harness.service.ingest([entry('error')]);

    expect(result).toEqual({ accepted: 1, stored: 0 });
    expect(harness.insertedBatches).toHaveLength(0);
  });

  it('skips insertion when every entry is below threshold', async () => {
    const harness = createHarness(settings({ minLevel: 'error' }));

    const result = await harness.service.ingest([entry('debug'), entry('warn')]);

    expect(result).toEqual({ accepted: 2, stored: 0 });
    expect(harness.insertedBatches).toHaveLength(0);
  });

  it('maps a surviving batch into one bulk insert', async () => {
    const harness = createHarness(settings({ minLevel: 'debug' }));
    const entries: LogEntryInput[] = [
      {
        ...entry('debug', 'admin', 'debug message'),
        context: { requestId: 'request-1' },
        correlationId: 'correlation-1',
      },
      {
        ...entry('warn', 'public-astro', 'warn message'),
        durationMs: 42,
        route: '/projects',
        statusCode: 202,
      },
      {
        ...entry('error', 'rag-service', 'error message'),
        errorName: 'RetrievalError',
        errorMessage: 'retrieval failed',
        errorStack: 'stack trace',
      },
    ];

    const result = await harness.service.ingest(entries);

    expect(result).toEqual({ accepted: 3, stored: 3 });
    expect(harness.insertedBatches).toHaveLength(1);
    expect(harness.insertedBatches[0]).toHaveLength(3);
    expect(harness.insertedBatches[0]?.every((record) => record.id.length > 0)).toBe(true);
    expect(new Set(harness.insertedBatches[0]?.map((record) => record.id)).size).toBe(3);
    expect(harness.insertedBatches[0]?.[0]).toMatchObject({
      timestamp,
      level: 'debug',
      service: 'admin',
      message: 'debug message',
      context: { requestId: 'request-1' },
      correlationId: 'correlation-1',
    });
    expect(harness.insertedBatches[0]?.[1]).toMatchObject({
      durationMs: 42,
      route: '/projects',
      statusCode: 202,
    });
    expect(harness.insertedBatches[0]?.[2]).toMatchObject({
      errorName: 'RetrievalError',
      errorMessage: 'retrieval failed',
      errorStack: 'stack trace',
    });
  });

  it('loads capture settings once for a 50-entry batch', async () => {
    const harness = createHarness(settings({ minLevel: 'debug' }));
    const entries = Array.from({ length: 50 }, (_, index) =>
      entry('info', 'admin', `entry-${index}`)
    );

    const result = await harness.service.ingest(entries);

    expect(result).toEqual({ accepted: 50, stored: 50 });
    expect(harness.getSettingsCalls()).toBe(1);
  });

  it('escalates only the captured entries, not the filtered ones', async () => {
    const harness = createHarness(settings({ minLevel: 'warn' }));

    await harness.service.ingest([entry('info'), entry('warn'), entry('error')]);

    expect(harness.escalatedBatches).toHaveLength(1);
    expect(harness.escalatedBatches[0]?.map((item) => item.level)).toEqual(['warn', 'error']);
  });

  it('does not escalate when capture is disabled', async () => {
    const harness = createHarness(settings({ enabled: false }));

    await harness.service.ingest([entry('error')]);

    expect(harness.escalatedBatches).toHaveLength(0);
  });

  it('does not escalate when nothing met the threshold', async () => {
    const harness = createHarness(settings({ minLevel: 'error' }));

    await harness.service.ingest([entry('info')]);

    expect(harness.escalatedBatches).toHaveLength(0);
  });
});
