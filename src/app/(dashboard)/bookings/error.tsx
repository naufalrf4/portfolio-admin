'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Bookings page error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="max-w-md w-full rounded-[var(--radius-container)] p-8 bg-[var(--bg-elevated)] text-center"
          style={{
            boxShadow:
              '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="inline-flex p-4 rounded-2xl bg-[var(--bg-elevated)] mb-4"
            style={{
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            We encountered an error while loading the bookings page. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">Error ID: {error.digest}</p>
          )}
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
