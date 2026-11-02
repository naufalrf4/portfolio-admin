import { and, eq, lt } from 'drizzle-orm';
import type { LogCaptureSettings, LogLevel } from '@naufalrf/contracts';
import { logSettingsService } from '@/lib/api/handlers/log-settings.service';
import { db } from '@/lib/db';
import { appLogs, notificationOutbox } from '@/lib/db/schema';
import { subtractDaysFromNow } from '@/lib/utils/date';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const satisfies readonly LogLevel[];

export interface LogRetentionDatabase {
  deleteLogs(level: LogLevel, cutoff: Date): Promise<number>;
  deleteOutbox(input: { readonly status: 'sent'; readonly cutoff: Date }): Promise<number>;
}

interface LogSettingsSource {
  getCaptureSettings(): Promise<LogCaptureSettings>;
}

const drizzleLogRetentionDatabase: LogRetentionDatabase = {
  async deleteLogs(level, cutoff) {
    const deleted = await db
      .delete(appLogs)
      .where(and(eq(appLogs.level, level), lt(appLogs.timestamp, cutoff.toISOString())))
      .returning({ id: appLogs.id });
    return deleted.length;
  },
  async deleteOutbox({ status, cutoff }) {
    const deleted = await db
      .delete(notificationOutbox)
      .where(
        and(
          eq(notificationOutbox.status, status),
          lt(notificationOutbox.sentAt, cutoff.toISOString())
        )
      )
      .returning({ id: notificationOutbox.id });
    return deleted.length;
  },
};

export class LogRetentionService {
  constructor(
    private readonly database: LogRetentionDatabase = drizzleLogRetentionDatabase,
    private readonly settingsSource: LogSettingsSource = logSettingsService
  ) {}

  async cleanup(): Promise<{
    readonly deletedByLevel: Record<LogLevel, number>;
    readonly deletedOutbox: number;
  }> {
    const settings = await this.settingsSource.getCaptureSettings();
    const deletedByLevel: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const level of LOG_LEVELS) {
      deletedByLevel[level] = await this.database.deleteLogs(
        level,
        subtractDaysFromNow(settings.retentionDays[level])
      );
    }
    const deletedOutbox = await this.database.deleteOutbox({
      status: 'sent',
      cutoff: subtractDaysFromNow(30),
    });
    return { deletedByLevel, deletedOutbox };
  }
}

export const logRetentionService = new LogRetentionService();
