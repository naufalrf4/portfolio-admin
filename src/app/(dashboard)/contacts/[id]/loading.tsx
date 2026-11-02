import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/PageWrapper';
import Link from 'next/link';

export default function ContactDetailLoading() {
  return (
    <PageWrapper>
      <div className="mb-6">
        <Link href="/contacts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {}
        <div
          className="rounded-[var(--radius-container)] p-6 animate-pulse"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div
                className="h-6 w-48 rounded"
                style={{
                  background: 'var(--text-secondary)',
                }}
              />
              <div
                className="h-4 w-64 rounded"
                style={{
                  background: 'var(--border)',
                }}
              />
            </div>
            <div
              className="h-8 w-20 rounded-2xl"
              style={{
                background: 'var(--border)',
              }}
            />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    background: 'var(--text-secondary)',
                  }}
                />
                <div
                  className="h-4 w-40 rounded"
                  style={{
                    background: 'var(--border)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {}
        <div
          className="rounded-[var(--radius-container)] p-6 animate-pulse"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="h-6 w-32 rounded mb-4"
            style={{
              background: 'var(--text-secondary)',
            }}
          />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-4 rounded"
                style={{
                  background: 'var(--border)',
                  width: i === 5 ? '60%' : '100%',
                }}
              />
            ))}
          </div>
        </div>

        {}
        <div className="flex gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 w-32 rounded-2xl"
              style={{
                background: 'var(--teal)',
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
