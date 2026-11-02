import { createLogger } from '@naufalrf/http';
import type { Logger } from '@naufalrf/http';
import { createId } from '@paralleldrive/cuid2';
import type { LogEntryInput } from '@naufalrf/contracts';

function createAdminSink(): (entry: LogEntryInput) => void {
  return (entry) => {
    if (typeof window !== 'undefined') {
      return;
    }

    void (async () => {
      try {
        const { logSettingsService } = await import('@/lib/api/handlers/log-settings.service');
        const settings = await logSettingsService.getCaptureSettings();

        if (!settings.enabled) {
          return;
        }

        const { meetsLevel, effectiveLevelFor } = await import('@naufalrf/contracts');
        const threshold = effectiveLevelFor(entry.service, settings);
        if (!meetsLevel(entry.level, threshold)) {
          return;
        }

        const { db } = await import('@/lib/db');
        const { appLogs } = await import('@/lib/db/schema');

        await db.insert(appLogs).values({
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
        });
      } catch {
        return;
      }
    })();
  };
}

const adminLogger: Logger = createLogger({
  service: 'admin',
  sink: createAdminSink(),
  isDevelopment: process.env.NODE_ENV !== 'production',
});

export const logger = adminLogger;
