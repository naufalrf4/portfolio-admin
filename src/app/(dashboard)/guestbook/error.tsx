'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function GuestbookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Guestbook error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full rounded-[var(--radius-container)] p-8 bg-bg-elevated text-center">
          <div className="inline-flex p-4 rounded-2xl bg-bg-elevated mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">Failed to load guestbook entries</p>
          {error.message && (
            <p className="text-sm text-destructive mb-6 px-4 py-2 rounded-2xl font-mono border border-line-strong">
              {error.message}
            </p>
          )}
          <Button onClick={reset} className="w-full">
            <RefreshCcw className="h-5 w-5" />
            Try again
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
