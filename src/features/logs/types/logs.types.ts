export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogService =
  | 'admin'
  | 'public-astro'
  | 'links-astro'
  | 'ngl-svelte'
  | 'rag-service';

export interface AppLogRow {
  id: string;
  timestamp: string;
  receivedAt: string;
  level: LogLevel;
  service: LogService;
  message: string;
  context: unknown | null;
  errorName: string | null;
  errorMessage: string | null;
  errorStack: string | null;
  correlationId: string | null;
  durationMs: number | null;
  route: string | null;
  statusCode: number | null;
}

export interface LogCounts {
  debug: number;
  info: number;
  warn: number;
  error: number;
}

export interface LogFilters {
  level?: LogLevel;
  service?: LogService;
  message?: string;
  correlationId?: string;
}

export type ServiceOverrides = Partial<Record<LogService, LogLevel>>;

export interface RetentionDays {
  debug: number;
  info: number;
  warn: number;
  error: number;
}

export interface LogCaptureSettings {
  id: string;
  minLevel: LogLevel;
  enabled: boolean;
  serviceOverrides: ServiceOverrides;
  retentionDays: RetentionDays;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLogCaptureSettingsInput {
  minLevel?: LogLevel;
  enabled?: boolean;
  serviceOverrides?: ServiceOverrides;
  retentionDays?: RetentionDays;
}
