'use client';

import { Card } from '@/components/ui/card';
import type { RecentInteraction } from '../types/analytics.types';

export function RecentInteractions({
  data,
  loading,
}: {
  data: RecentInteraction[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-16 rounded-2xl bg-line animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Interactions</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Latest submissions captured with normalized metadata.
        </p>
      </div>
      {data.length === 0 ? (
        <div className="rounded-[28px] card-inset bg-[var(--bg-elevated)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
          No recent interactions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 shadow-surface-raised"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {item.type} · {item.sourceApp} · {item.sourcePath}
                  </p>
                  {(item.city || item.country) && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {[item.city, item.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
