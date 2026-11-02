'use client';

import { Card } from '@/components/ui/card';
import type { InteractionTrendPoint } from '../types/analytics.types';
import { formatDateKeyShort } from '@/lib/utils/date';

export function InteractionTrendChart({
  data,
  loading,
}: {
  data: InteractionTrendPoint[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="space-y-6">
          <div className="h-6 w-44 rounded bg-line animate-pulse" />
          <div className="h-64 rounded-[28px] bg-line animate-pulse" />
        </div>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((item) => Math.max(item.submissions, item.clicks)), 1);

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Activity Trend</h3>
        <p className="text-sm text-[var(--text-secondary)]">Daily submissions and tracked link clicks.</p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-[28px] card-inset bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]">
          No activity recorded in this range.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
              Submissions
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
              Clicks
            </span>
          </div>
          <div className="grid h-64 grid-cols-[repeat(auto-fit,minmax(18px,1fr))] items-end gap-2 rounded-[28px] card-inset bg-[var(--bg-elevated)] p-4">
            {data.map((item) => (
              <div key={item.date} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="flex w-full items-end justify-center gap-1">
                  <div
                    className="w-2 rounded-full bg-[var(--teal)]"
                    style={{
                      height: `${Math.max((item.submissions / maxValue) * 180, item.submissions > 0 ? 8 : 0)}px`,
                    }}
                    title={`${item.submissions} submissions`}
                  />
                  <div
                    className="w-2 rounded-full bg-[var(--amber)]"
                    style={{
                      height: `${Math.max((item.clicks / maxValue) * 180, item.clicks > 0 ? 8 : 0)}px`,
                    }}
                    title={`${item.clicks} clicks`}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] [writing-mode:vertical-rl] rotate-180">
                  {formatDateKeyShort(item.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
