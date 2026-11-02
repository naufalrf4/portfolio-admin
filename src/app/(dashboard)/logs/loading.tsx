import { ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { LogsTableSkeleton } from '@/features/logs';

export default function LogsLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Application Logs"
        description="Centralized structured log capture, live browsing, and retention configuration"
        icon={<ScrollText />}
        stats={[
          { label: 'Total Ingested', value: 0 },
          { label: 'Errors', value: 0 },
          { label: 'Warnings', value: 0 },
          { label: 'Info / Debug', value: 0 },
        ]}
      />

      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm" />
        <LogsTableSkeleton rowCount={8} />
      </div>
    </PageWrapper>
  );
}
