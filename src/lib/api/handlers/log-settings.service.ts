import { db } from '@/lib/db';
import { logSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import type { LogCaptureSettings, LogLevel, LogService } from '@naufalrf/contracts';
import type { UpdateLogSettingsInput } from '@/lib/validations/log-settings.schema';

const DEFAULT_MIN_LEVEL: LogLevel = 'info';

const DEFAULT_RETENTION_DAYS: Record<LogLevel, number> = {
  debug: 7,
  info: 30,
  warn: 90,
  error: 90,
};

const CACHE_TTL_MS = 30_000;

let cached: { value: LogCaptureSettings; expiresAt: number } | null = null;

function toCaptureSettings(row: typeof logSettings.$inferSelect): LogCaptureSettings {
  return {
    minLevel: row.minLevel as LogLevel,
    enabled: row.enabled,
    serviceOverrides: (row.serviceOverrides ?? {}) as Partial<Record<LogService, LogLevel>>,
    retentionDays: (row.retentionDays ?? DEFAULT_RETENTION_DAYS) as Record<LogLevel, number>,
  };
}

export class LogSettingsService {
  async get() {
    const result = await db.select().from(logSettings).limit(1);
    let settings = result[0];

    if (!settings) {
      const [created] = await db
        .insert(logSettings)
        .values({
          id: createId(),
          updatedAt: new Date().toISOString(),
          minLevel: DEFAULT_MIN_LEVEL,
          enabled: true,
          serviceOverrides: {},
          retentionDays: DEFAULT_RETENTION_DAYS,
        })
        .returning();
      settings = created;
    }

    if (!settings) {
      throw new Error('Failed to resolve log settings');
    }

    return settings;
  }

  async update(data: UpdateLogSettingsInput) {
    const settings = await this.get();

    const [updated] = await db
      .update(logSettings)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(logSettings.id, settings.id))
      .returning();

    cached = null;

    return updated;
  }

  async getCaptureSettings(): Promise<LogCaptureSettings> {
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const row = await this.get();
    const value = toCaptureSettings(row);
    cached = { value, expiresAt: now + CACHE_TTL_MS };

    return value;
  }

  invalidateCache(): void {
    cached = null;
  }
}

export const logSettingsService = new LogSettingsService();
