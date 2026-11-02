'use client';

import { BarChart3 } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnalyticsDashboard } from '@/features/analytics';

export function AnalyticsPageContent() {
  return (
    <PageWrapper>
      <PageHeader
        title="Analytics"
        description="Monitor your portfolio performance and visitor insights"
        icon={<BarChart3 />}
      />

      <AnalyticsDashboard />
    </PageWrapper>
  );
}
