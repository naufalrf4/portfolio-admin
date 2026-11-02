'use client';

import { Card } from '@/components/ui/card';
import type { InteractionSourceAppStat } from '../types/analytics.types';

export function SourceAppBreakdown({
  data,
  loading,
}: {
  data: InteractionSourceAppStat[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-2xl bg-line animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Source Apps</h3>
        <p className="text-sm text-[var(--text-secondary)]">Where submissions and clicks originate.</p>
      </div>
      {data.length === 0 ? (
        <div className="rounded-[28px] card-inset bg-[var(--bg-elevated)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
          No source app data available.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.app}
              className="rounded-2xl bg-[var(--bg-elevated)] px-4 py-3 shadow-surface-raised"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{item.app}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {item.total.toLocaleString()} total activities
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full tile-tint-blue px-2.5 py-1 font-semibold">
                    {item.submissions} submissions
                  </span>
                  <span className="rounded-full tile-tint-emerald px-2.5 py-1 font-semibold">
                    {item.clicks} clicks
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
