'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Globe2, TrendingUp, MousePointerClick } from 'lucide-react';
import { SUNKEN_SHADOW } from '../constants';

type AnalyticsSummary = {
  overview: {
    totalSubmissions: number;
    totalClicks: number;
    uniqueCountries: number;
  };
};

type Tone = 'blue' | 'purple' | 'emerald' | 'amber';

const TONE_TINT_CLASS: Record<Tone, string> = {
  blue: 'tile-tint-blue',
  purple: 'tile-tint-purple',
  emerald: 'tile-tint-emerald',
  amber: 'tile-tint-amber',
};

export function AnalyticsSummaryCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setLoading(true);
      try {
        const response = await fetch('/api/v1/admin/analytics?range=30d', {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadSummary();

    return () => controller.abort();
  }, []);

  const summaryCards = [
    {
      label: 'Submissions',
      value: data?.overview.totalSubmissions ?? 0,
      icon: TrendingUp,
      tone: 'blue' as const,
    },
    {
      label: 'Tracked Clicks',
      value: data?.overview.totalClicks ?? 0,
      icon: MousePointerClick,
      tone: 'emerald' as const,
    },
    {
      label: 'Countries',
      value: data?.overview.uniqueCountries ?? 0,
      icon: Globe2,
      tone: 'purple' as const,
    },
  ];

  return (
    <Card
      className={`p-6 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center tile-tint-blue"
            style={{ boxShadow: SUNKEN_SHADOW }}
          >
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Analytics Overview</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-plus-jakarta)]">
              {loading ? 'Loading…' : 'Live data'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`rounded-2xl px-4 py-3 shadow-surface-raised ${TONE_TINT_CLASS[item.tone]}`}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <p className="mt-2 text-xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
