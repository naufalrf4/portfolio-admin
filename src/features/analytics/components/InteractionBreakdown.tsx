'use client';

import { Card } from '@/components/ui/card';
import type { InteractionTypeStat } from '../types/analytics.types';

export function InteractionBreakdown({
  data,
  loading,
}: {
  data: InteractionTypeStat[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-24 rounded bg-line animate-pulse" />
              <div className="h-2 rounded-full bg-line animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Submission Types</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Normalized across contact, booking, guestbook, and NGL.
        </p>
      </div>
      {data.length === 0 ? (
        <div className="rounded-[28px] card-inset bg-[var(--bg-elevated)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                  <span className="text-[var(--text-secondary)]">{item.count.toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
