'use client';

import { useEffect } from 'react';
import { BellRing, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error;
  }, [error]);

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

      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm border border-destructive/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <BellRing className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          Failed to Load Notifications
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6">
          An unexpected error occurred while loading the notification management dashboard.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="h-9 px-4 rounded-xl text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Try Again
        </Button>
      </div>
    </PageWrapper>
  );
}
