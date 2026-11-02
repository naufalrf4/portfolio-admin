'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function BookingDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    logger.error('Booking detail error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="mb-6">
        <button
          onClick={() => router.push('/bookings')}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
      </div>

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
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Unable to Load Booking</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            We encountered an error while loading this booking. The booking may not exist or there
            was a problem connecting to the server.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/bookings')} className="flex-1">
              Back to List
            </Button>
            <Button onClick={reset} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
