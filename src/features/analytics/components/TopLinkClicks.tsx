'use client';

import { Card } from '@/components/ui/card';
import { MousePointerClick } from 'lucide-react';
import type { TelemetryLinkStat } from '../types/analytics.types';

export function TopLinkClicks({ data, loading }: { data: TelemetryLinkStat[]; loading: boolean }) {
  if (loading) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-14 rounded-2xl bg-line animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Top Link Clicks</h3>
          <p className="text-sm text-[var(--text-secondary)]">Telemetry from the links app.</p>
        </div>
        <MousePointerClick className="h-5 w-5 text-[var(--text-secondary)]" />
      </div>

      {data.length === 0 ? (
        <div className="rounded-[28px] card-inset bg-[var(--bg-elevated)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
          No click telemetry yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 shadow-surface-raised"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {item.type} · {item.sourceApp}
                </p>
              </div>
              <span className="rounded-full tile-tint-emerald px-3 py-1 text-xs font-bold">
                {item.clicks}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
