import { BellRing } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function NotificationsLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Telegram Notifications"
        description="Configure target Telegram channels, event routing matrix, and monitor delivery queue"
        icon={<BellRing />}
        stats={[
          { label: 'Configured Channels', value: 0 },
          { label: 'Active Channels', value: 0 },
          { label: 'Active Rules', value: 0 },
          { label: 'Failed in Outbox', value: 0 },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div className="h-12 w-80 rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm animate-pulse" />
        <div className="h-64 rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm animate-pulse" />
      </div>
    </PageWrapper>
  );
}
