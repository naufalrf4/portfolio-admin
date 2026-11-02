import type { LogEntryInput, LogLevel } from '@naufalrf/contracts';
import { notificationService } from '@/lib/services/notificationService';
import type { NotificationService } from '@/lib/services/notificationService';

const ESCALATED_LEVELS = new Set<LogLevel>(['warn', 'error']);
const SUMMARY_LIMIT = 400;

// Notification failures are themselves reported through logger.error. Escalating
// those would enqueue a notification whose own failure escalates again, so the
// notification subsystem's own errors are never escalated.
const SELF_REFERENTIAL_OPERATIONS = new Set(['notification.enqueue', 'notification.dispatch']);

function isSelfReferential(entry: LogEntryInput): boolean {
  const context = entry.context;

  if (!context || typeof context !== 'object') {
    return false;
  }

  const operation = (context as { readonly operation?: unknown }).operation;
  return typeof operation === 'string' && SELF_REFERENTIAL_OPERATIONS.has(operation);
}

function severityRank(level: LogLevel): number {
  return level === 'error' ? 2 : 1;
}

function summarize(entries: readonly LogEntryInput[]): string {
  const lines = entries.map((entry) => {
    const detail = entry.errorMessage ? `${entry.message} — ${entry.errorMessage}` : entry.message;
    return `[${entry.level}] ${detail}`;
  });
  const joined = lines.join('\n');

  return joined.length > SUMMARY_LIMIT ? `${joined.slice(0, SUMMARY_LIMIT - 1)}…` : joined;
}

export class LogEscalationService {
  constructor(private readonly notifications: NotificationService = notificationService) {}

  // Groups a single ingest batch per service so one burst produces one
  // notification instead of one per line.
  async escalate(entries: readonly LogEntryInput[]): Promise<number> {
    const candidates = entries.filter(
      (entry) => ESCALATED_LEVELS.has(entry.level) && !isSelfReferential(entry)
    );

    if (candidates.length === 0) {
      return 0;
    }

    const grouped = new Map<string, LogEntryInput[]>();

    for (const entry of candidates) {
      const existing = grouped.get(entry.service);

      if (existing) {
        existing.push(entry);
        continue;
      }

      grouped.set(entry.service, [entry]);
    }

    let escalated = 0;

    for (const [service, group] of grouped) {
      const highestSeverity = group.reduce<LogLevel>(
        (highest, entry) => (severityRank(entry.level) > severityRank(highest) ? entry.level : highest),
        'warn'
      );
      const latest = group.reduce((newest, entry) =>
        entry.timestamp > newest.timestamp ? entry : newest
      );

      await this.notifications.enqueue('log.error', {
        count: group.length,
        highestSeverity,
        service,
        summary: summarize(group),
        timestamp: latest.timestamp,
      });

      escalated += 1;
    }

    return escalated;
  }
}

export const logEscalationService = new LogEscalationService();
