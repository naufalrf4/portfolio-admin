import { describe, expect, it } from 'bun:test';
import { appLogs } from '@/lib/db/schema';
import { LogQueryService } from '@/lib/services/logQuery.service';
import { decodeCursor } from '@/features/logs/utils/cursor';

type AppLogRow = typeof appLogs.$inferSelect;
type LevelCountRow = { readonly level: string; readonly total: number };

const timestamp = '2026-08-28T05:00:00.000Z';

function row(id: string, rowTimestamp = timestamp): AppLogRow {
  return {
    id,
    timestamp: rowTimestamp,
    receivedAt: rowTimestamp,
    level: 'info',
    service: 'admin',
    message: `message-${id}`,
    context: null,
    errorName: null,
    errorMessage: null,
    errorStack: null,
    correlationId: null,
    durationMs: null,
    route: null,
    statusCode: null,
  };
}

function createHarness(logRows: readonly AppLogRow[], countRows: readonly LevelCountRow[] = []) {
  const database = {
    queryLogs: async () => logRows,
    queryLevelCounts: async () => countRows,
    clear: async () => 0,
  };

  return new LogQueryService(database);
}

describe('LogQueryService', () => {
  it('returns the requested page and a cursor when an extra row exists', async () => {
    const service = createHarness([row('log-3'), row('log-2'), row('log-1')]);

    const result = await service.query({ limit: 2 });

    expect(result.logs.map((log) => log.id)).toEqual(['log-3', 'log-2']);
    expect(result.nextCursor).not.toBeNull();
  });

  it('returns every available row without a cursor when no extra row exists', async () => {
    const service = createHarness([row('log-2'), row('log-1')]);

    const result = await service.query({ limit: 3 });

    expect(result.logs.map((log) => log.id)).toEqual(['log-2', 'log-1']);
    expect(result.nextCursor).toBeNull();
  });

  it('encodes the last returned row position in the next cursor', async () => {
    const lastReturnedTimestamp = '2026-08-28T04:59:00.000Z';
    const service = createHarness([
      row('log-3'),
      row('log-2', lastReturnedTimestamp),
      row('log-1'),
    ]);

    const result = await service.query({ limit: 2 });

    expect(result.nextCursor).not.toBeNull();
    if (result.nextCursor === null) {
      throw new Error('Expected a continuation cursor');
    }
    expect(decodeCursor(result.nextCursor)).toEqual({
      timestamp: lastReturnedTimestamp,
      id: 'log-2',
    });
  });

  it('fills absent log levels with zero counts', async () => {
    const service = createHarness([], [
      { level: 'info', total: 12 },
      { level: 'error', total: 3 },
    ]);

    const result = await service.countsByLevel();

    expect(result).toEqual({ debug: 0, info: 12, warn: 0, error: 3 });
  });
});
