import { createId } from '@paralleldrive/cuid2';
import { effectiveLevelFor, meetsLevel } from '@naufalrf/contracts';
import type {
  LogCaptureSettings,
  LogEntryInput,
  LogIngestResult,
} from '@naufalrf/contracts';
import { logSettingsService } from '@/lib/api/handlers/log-settings.service';
import { db } from '@/lib/db';
import { appLogs } from '@/lib/db/schema';
import { logEscalationService } from '@/lib/services/logEscalation.service';

type AppLogRecord = typeof appLogs.$inferInsert;

interface LogDatabase {
  insert(table: typeof appLogs): {
    values(records: AppLogRecord[]): PromiseLike<unknown>;
  };
}

interface LogSettingsSource {
  getCaptureSettings(): Promise<LogCaptureSettings>;
}

interface LogEscalationSource {
  escalate(entries: readonly LogEntryInput[]): Promise<number>;
}

export class LogIngestService {
  constructor(
    private readonly database: LogDatabase = db,
    private readonly settingsSource: LogSettingsSource = logSettingsService,
    private readonly escalationSource: LogEscalationSource = logEscalationService
  ) {}

  async ingest(entries: readonly LogEntryInput[]): Promise<LogIngestResult> {
    const accepted = entries.length;
    const settings = await this.settingsSource.getCaptureSettings();

    if (!settings.enabled) {
      return { accepted, stored: 0 };
    }

    const captured = entries.filter((entry) =>
      meetsLevel(entry.level, effectiveLevelFor(entry.service, settings))
    );

    const records: AppLogRecord[] = captured.map((entry) => ({
      id: createId(),
      timestamp: entry.timestamp,
      level: entry.level,
      service: entry.service,
      message: entry.message,
      ...(entry.context !== undefined ? { context: entry.context } : {}),
      ...(entry.errorName !== undefined ? { errorName: entry.errorName } : {}),
      ...(entry.errorMessage !== undefined ? { errorMessage: entry.errorMessage } : {}),
      ...(entry.errorStack !== undefined ? { errorStack: entry.errorStack } : {}),
      ...(entry.correlationId !== undefined ? { correlationId: entry.correlationId } : {}),
      ...(entry.durationMs !== undefined ? { durationMs: entry.durationMs } : {}),
      ...(entry.route !== undefined ? { route: entry.route } : {}),
      ...(entry.statusCode !== undefined ? { statusCode: entry.statusCode } : {}),
    }));

    if (records.length === 0) {
      return { accepted, stored: 0 };
    }

    await this.database.insert(appLogs).values(records);

    // Escalation is a side channel: a notification failure must never make log
    // ingestion fail, because the log itself is already durably stored.
    await this.escalationSource.escalate(captured).catch(() => undefined);

    return { accepted, stored: records.length };
  }
}

export const logIngestService = new LogIngestService();
