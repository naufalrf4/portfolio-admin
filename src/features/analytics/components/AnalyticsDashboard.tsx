'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OverviewCards } from './OverviewCards';
import { CountryDistribution } from './CountryDistribution';
import { useAnalyticsDashboard } from '../hooks/useAnalyticsDashboard';
import { InteractionTrendChart } from './InteractionTrendChart';
import { InteractionLocationMap } from './InteractionLocationMap';
import { InteractionBreakdown } from './InteractionBreakdown';
import { SourceAppBreakdown } from './SourceAppBreakdown';
import { TopLinkClicks } from './TopLinkClicks';
import { RecentInteractions } from './RecentInteractions';

interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d' | '90d';
}

export function AnalyticsDashboard({ timeRange = '30d' }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>(timeRange);
  const { data, loading } = useAnalyticsDashboard(range);

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="geo">Geographic</TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                range === option
                  ? 'bg-accent text-accent-foreground shadow-surface-raised'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-surface-raised'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <OverviewCards
          loading={loading}
          stats={{
            totalInteractions:
              (data?.overview.totalSubmissions || 0) + (data?.overview.totalClicks || 0),
            trackedClicks: data?.overview.totalClicks || 0,
            countriesReached: data?.overview.uniqueCountries || 0,
          }}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <InteractionTrendChart data={data?.trend || []} loading={loading} />
          <InteractionBreakdown data={data?.interactionTypes || []} loading={loading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SourceAppBreakdown data={data?.sourceApps || []} loading={loading} />
          <RecentInteractions data={data?.recentInteractions || []} loading={loading} />
        </div>
      </TabsContent>

      <TabsContent value="submissions" className="space-y-6">
        <InteractionLocationMap items={data?.locationItems || []} loading={loading} />
        <div className="grid gap-6 xl:grid-cols-2">
          <InteractionBreakdown data={data?.interactionTypes || []} loading={loading} />
          <RecentInteractions data={data?.recentInteractions || []} loading={loading} />
        </div>
      </TabsContent>

      <TabsContent value="telemetry" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TopLinkClicks data={data?.topLinks || []} loading={loading} />
          <SourceAppBreakdown data={data?.sourceApps || []} loading={loading} />
        </div>
        <InteractionTrendChart data={data?.trend || []} loading={loading} />
      </TabsContent>

      <TabsContent value="geo" className="space-y-6">
        <CountryDistribution data={data?.countries || []} loading={loading} />
        <InteractionLocationMap items={data?.locationItems || []} loading={loading} />
      </TabsContent>
    </Tabs>
  );
}
