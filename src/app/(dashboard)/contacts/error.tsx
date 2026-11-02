'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { logger } from '@/lib/utils/logger';

export default function ContactsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Contacts page error:', error);
  }, [error]);

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="rounded-[var(--radius-container)] p-8 max-w-lg w-full text-center"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {}
          <div className="flex justify-center mb-6">
            <div
              className="rounded-2xl p-4 w-16 h-16 flex items-center justify-center"
              style={{
                background: 'var(--bg-elevated)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {}
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            Failed to load contacts
          </h2>
          <p
            className="text-sm mb-6"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            {error.message || 'An unexpected error occurred while loading the contacts page.'}
          </p>

          {}
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold transition-all duration-300 hover:-translate-y-[1px] active:translate-y-[0.5px]"
            style={{
              background: 'var(--teal)',
              color: 'var(--on-accent)',
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 2px 8px -2px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 2px 8px -2px rgba(0, 0, 0, 0.3)';
            }}
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
