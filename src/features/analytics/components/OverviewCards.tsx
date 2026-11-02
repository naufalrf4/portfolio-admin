'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Eye, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'purple' | 'emerald' | 'amber';

const TONE_TINT_CLASS: Record<Tone, string> = {
  blue: 'tile-tint-blue',
  purple: 'tile-tint-purple',
  emerald: 'tile-tint-emerald',
  amber: 'tile-tint-amber',
};

interface StatCardProps {
  icon: ReactNode;
  tone: Tone;
  title: string;
  value: number | string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export function OverviewCard({ icon, tone, title, value, change }: StatCardProps) {
  return (
    <Card
      className={cn(
        'p-6 transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        'bg-[var(--bg-elevated)]',
        'shadow-surface-raised',
        'hover:shadow-surface-raised'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            TONE_TINT_CLASS[tone],
            'shadow-surface-raised'
          )}
        >
          {icon}
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              change.isPositive ? 'tile-tint-emerald' : 'bg-muted text-destructive'
            )}
          >
            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{title}</p>
      <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-plus-jakarta)]">
        {value}
      </p>
    </Card>
  );
}

interface OverviewCardsProps {
  stats?: {
    totalInteractions: number;
    trackedClicks: number;
    countriesReached: number;
  };
  loading?: boolean;
}

export function OverviewCards({ stats, loading }: OverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-6 bg-[var(--bg-elevated)] shadow-surface-raised"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-line animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-line rounded animate-pulse" />
                <div className="h-8 w-20 bg-line rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const data = stats || {
    totalInteractions: 0,
    trackedClicks: 0,
    countriesReached: 0,
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <OverviewCard
        icon={<Eye className="w-6 h-6" />}
        tone="blue"
        title="Total Interactions"
        value={data.totalInteractions.toLocaleString()}
      />
      <OverviewCard
        icon={<Users className="w-6 h-6" />}
        tone="purple"
        title="Tracked Clicks"
        value={data.trackedClicks.toLocaleString()}
      />
      <OverviewCard
        icon={<Activity className="w-6 h-6" />}
        tone="emerald"
        title="Countries Reached"
        value={data.countriesReached}
      />
    </div>
  );
}
