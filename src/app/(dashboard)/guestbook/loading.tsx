import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';

const SURFACE_STYLES = {
  background: 'var(--bg-elevated)',
  shadows: {
    small:
      '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.02), inset 1px 1px 2px rgba(255, 255, 255, 0.05)',
    inset: 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.02)',
  },
};

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-[var(--radius-base)] p-6 animate-pulse"
      style={{
        background: SURFACE_STYLES.background,
        boxShadow: SURFACE_STYLES.shadows.small,
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-full"
          style={{
            background: 'rgba(107, 114, 128, 0.3)',
            boxShadow: SURFACE_STYLES.shadows.inset,
          }}
        />
        <div className="flex-1">
          <div
            className="h-4 rounded-full mb-2"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
              width: '60%',
            }}
          />
          <div
            className="h-3 rounded-full"
            style={{
              background: 'rgba(107, 114, 128, 0.2)',
              width: '40%',
            }}
          />
        </div>
      </div>
      <div
        className="h-20 rounded-[16px] mb-4"
        style={{
          background: 'rgba(107, 114, 128, 0.2)',
        }}
      />
      <div className="flex items-center justify-between">
        <div
          className="h-6 rounded-full"
          style={{
            background: 'rgba(107, 114, 128, 0.3)',
            width: '100px',
          }}
        />
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
            }}
          />
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background: 'rgba(107, 114, 128, 0.3)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function GuestbookLoading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Guestbook"
        description="Manage guestbook entries from visitors"
        icon={<MessageSquare />}
        stats={[
          { label: 'Total', value: 0, variant: 'default' },
          { label: 'Visible', value: 0, variant: 'success' },
          { label: 'Hidden', value: 0, variant: 'default' },
        ]}
      />

      <div
        className="rounded-[var(--radius-base)] p-2 mb-8 inline-flex gap-2"
        style={{
          background: SURFACE_STYLES.background,
          boxShadow: SURFACE_STYLES.shadows.inset,
        }}
      >
        {['All', 'Visible', 'Hidden'].map((label) => (
          <div
            key={label}
            className="px-6 py-3 rounded-[18px] font-medium"
            style={{
              background: 'rgba(107, 114, 128, 0.2)',
              color: 'rgba(156, 163, 175, 0.5)',
            }}
          >
            {label}{' '}
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: 'rgba(107, 114, 128, 0.2)',
              }}
            >
              0
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
    </PageWrapper>
  );
}
