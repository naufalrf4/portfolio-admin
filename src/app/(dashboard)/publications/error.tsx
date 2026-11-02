'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

export default function PublicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Publications page error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="rounded-[var(--radius-container)] p-12 text-center max-w-2xl mx-auto bg-bg-elevated">
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-bg-elevated">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2 text-foreground">
          Something went wrong
        </h2>
        <p className="mb-8 text-muted-foreground">
          {error.message || 'Failed to load publication links. Please try again.'}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </PageWrapper>
  );
}
