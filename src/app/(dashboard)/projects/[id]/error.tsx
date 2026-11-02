'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { logger } from '@/lib/utils/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error('Project detail page error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-12 max-w-lg text-center shadow-surface-raised">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] text-destructive mb-6 shadow-surface-raised">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3">
            Failed to Load Project
          </h2>

          <p className="text-[var(--text-secondary)] mb-2">
            Unable to load project details. The project might not exist or there was a connection
            error.
          </p>

          {error.message && (
            <p className="text-sm text-muted-foreground mb-6 font-mono">{error.message}</p>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={reset}
              className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200 bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-surface-raised-sm hover:shadow-surface-raised hover:-translate-y-[1px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Link href="/projects">
              <Button className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200 bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-surface-raised-sm hover:shadow-surface-raised hover:-translate-y-[1px]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
