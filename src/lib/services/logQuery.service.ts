import { and, count, desc, eq, gte, ilike, inArray, lt, lte, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { decodeCursor, encodeCursor } from '@/features/logs/utils/cursor';
import type { CursorPosition } from '@/features/logs/utils/cursor';
import { db } from '@/lib/db';
import { appLogs } from '@/lib/db/schema';
import type { LogQueryInput } from '@/lib/validations/log-query.schema';

export type AppLogRow = typeof appLogs.$inferSelect;
type LevelCountRow = { readonly level: string; readonly total: number };
type LevelCounts = Record<'debug' | 'info' | 'warn' | 'error', number>;

export type LogLevelName = (typeof LOG_LEVELS)[number];

export type LogClearFilter = {
  readonly cutoff?: string;
  readonly levels?: readonly LogLevelName[];
};

interface LogDatabase {
  queryLogs(where: SQL | undefined, limit: number): PromiseLike<readonly AppLogRow[]>;
  queryLevelCounts(): PromiseLike<readonly LevelCountRow[]>;
  clear(input: LogClearFilter): PromiseLike<number>;
}

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

const defaultDatabase: LogDatabase = {
  queryLogs: (where, limit) =>
    db
      .select()
      .from(appLogs)
      .where(where)
      .orderBy(desc(appLogs.timestamp), desc(appLogs.id))
      .limit(limit),
  queryLevelCounts: () =>
    db
      .select({ level: appLogs.level, total: count() })
      .from(appLogs)
      .groupBy(appLogs.level),
  clear: async ({ cutoff, levels }) => {
    const filters = [
      cutoff === undefined ? undefined : lt(appLogs.timestamp, cutoff),
      levels === undefined ? undefined : inArray(appLogs.level, [...levels]),
    ].filter((filter): filter is SQL => filter !== undefined);

    const deleted = await db
      .delete(appLogs)
      .where(filters.length === 0 ? undefined : and(...filters))
      .returning({ id: appLogs.id });
    return deleted.length;
  },
};

export class LogQueryService {
  constructor(private readonly database: LogDatabase = defaultDatabase) {}

  async query(input: LogQueryInput): Promise<{
    logs: AppLogRow[];
    nextCursor: string | null;
  }> {
    const cursor = input.cursor === undefined ? undefined : decodeCursor(input.cursor);
    const filters = [
      input.level === undefined ? undefined : eq(appLogs.level, input.level),
      input.service === undefined ? undefined : eq(appLogs.service, input.service),
      input.message === undefined ? undefined : ilike(appLogs.message, `%${input.message}%`),
      input.correlationId === undefined
        ? undefined
        : eq(appLogs.correlationId, input.correlationId),
      input.from === undefined ? undefined : gte(appLogs.timestamp, input.from),
      input.to === undefined ? undefined : lte(appLogs.timestamp, input.to),
      cursor === undefined
        ? undefined
        : or(
            lt(appLogs.timestamp, cursor.timestamp),
            and(eq(appLogs.timestamp, cursor.timestamp), lt(appLogs.id, cursor.id))
          ),
    ].filter((filter): filter is SQL => filter !== undefined);
    const rows = await this.database.queryLogs(and(...filters), input.limit + 1);
    const hasNextPage = rows.length > input.limit;
    const logs = hasNextPage ? rows.slice(0, input.limit) : [...rows];
    const lastLog = logs.at(-1);
    const nextCursor =
      hasNextPage && lastLog !== undefined
        ? encodeCursor({ timestamp: lastLog.timestamp, id: lastLog.id } satisfies CursorPosition)
        : null;

    return { logs, nextCursor };
  }

  async countsByLevel(): Promise<LevelCounts> {
    const rows = await this.database.queryLevelCounts();
    const counts: LevelCounts = { debug: 0, info: 0, warn: 0, error: 0 };

    for (const level of LOG_LEVELS) {
      counts[level] = rows.find((row) => row.level === level)?.total ?? 0;
    }

    return counts;
  }

  async clear(input: { readonly cutoff?: Date; readonly levels?: readonly LogLevelName[] }): Promise<number> {
    return this.database.clear({
      ...(input.cutoff === undefined ? {} : { cutoff: input.cutoff.toISOString() }),
      ...(input.levels === undefined ? {} : { levels: input.levels }),
    });
  }
}

export const logQueryService = new LogQueryService();
