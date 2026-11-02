import { describe, expect, it } from 'bun:test';
import type { LogCaptureSettings, LogLevel } from '@naufalrf/contracts';
import {
  LogRetentionService,
  type LogRetentionDatabase,
} from '@/lib/services/logRetention.service';

function settings(retentionDays: Record<LogLevel, number>): LogCaptureSettings {
  return { minLevel: 'info', enabled: true, serviceOverrides: {}, retentionDays };
}

describe('LogRetentionService', () => {
  it('applies each level retention period with an independent cutoff', async () => {
    const deletions: { readonly level: LogLevel; readonly cutoff: Date }[] = [];
    const database: LogRetentionDatabase = {
      deleteLogs: async (level, cutoff) => {
        deletions.push({ level, cutoff });
        return 1;
      },
      deleteOutbox: async () => 0,
    };
    const service = new LogRetentionService(database, {
      getCaptureSettings: async () => settings({ debug: 7, info: 30, warn: 90, error: 120 }),
    });

    const result = await service.cleanup();

    expect(result.deletedByLevel).toEqual({ debug: 1, info: 1, warn: 1, error: 1 });
    expect(deletions.map((deletion) => deletion.level)).toEqual(['debug', 'info', 'warn', 'error']);
    expect(deletions[0]?.cutoff.getTime()).toBeGreaterThan(deletions[1]?.cutoff.getTime() ?? 0);
    expect(deletions[1]?.cutoff.getTime()).toBeGreaterThan(deletions[2]?.cutoff.getTime() ?? 0);
    expect(deletions[2]?.cutoff.getTime()).toBeGreaterThan(deletions[3]?.cutoff.getTime() ?? 0);
  });

  it('sweeps only sent outbox records older than thirty days', async () => {
    const outboxRequests: { readonly status: 'sent'; readonly cutoff: Date }[] = [];
    const database: LogRetentionDatabase = {
      deleteLogs: async () => 0,
      deleteOutbox: async (input) => {
        outboxRequests.push(input);
        return 3;
      },
    };
    const service = new LogRetentionService(database, {
      getCaptureSettings: async () => settings({ debug: 7, info: 30, warn: 90, error: 90 }),
    });

    const result = await service.cleanup();

    expect(result.deletedOutbox).toBe(3);
    expect(outboxRequests).toHaveLength(1);
    expect(outboxRequests[0]?.status).toBe('sent');
    expect(Date.now() - (outboxRequests[0]?.cutoff.getTime() ?? Date.now())).toBeGreaterThanOrEqual(
      30 * 86_400_000 - 10
    );
  });
});
