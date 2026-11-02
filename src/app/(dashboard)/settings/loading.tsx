import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';

const surfaceStyles = {
  background: 'var(--bg-elevated)',
  skeleton: 'var(--text-secondary)',
  extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
  buttonShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
};

function SkeletonCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl p-6 md:p-8 animate-pulse ${className}`}
      style={{
        background: surfaceStyles.background,
        boxShadow: surfaceStyles.extruded,
      }}
    >
      {children}
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="h-10 w-10 rounded-2xl"
        style={{
          background: surfaceStyles.background,
          boxShadow: surfaceStyles.inset,
        }}
      />
      <div
        className="h-6 w-32 rounded"
        style={{
          background: surfaceStyles.skeleton,
        }}
      />
    </div>
  );
}

function SkeletonInfoRows({ count }: { count: number }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: surfaceStyles.background,
        boxShadow: surfaceStyles.inset,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between py-4 border-b border-gray-200/50 last:border-0"
        >
          <div className="h-4 w-24 rounded" style={{ background: surfaceStyles.skeleton }} />
          <div className="h-4 w-32 rounded" style={{ background: surfaceStyles.skeleton }} />
        </div>
      ))}
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <PageWrapper>
      <PageHeader title="Settings" description="Manage your account and application preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="lg:col-span-2">
          <SkeletonHeader />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div
              className="rounded-full p-1 mx-auto sm:mx-0"
              style={{ boxShadow: surfaceStyles.extruded }}
            >
              <div
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full"
                style={{ background: surfaceStyles.skeleton }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <div className="h-8 w-48 rounded mb-2" style={{ background: surfaceStyles.skeleton }} />
              <div className="h-4 w-64 rounded" style={{ background: surfaceStyles.skeleton }} />
            </div>
          </div>

          <SkeletonInfoRows count={3} />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonHeader />
          <div className="mb-6">
            <SkeletonInfoRows count={2} />
          </div>
          <div
            className="h-12 w-full rounded-2xl"
            style={{
              background: 'var(--teal)',
              boxShadow: surfaceStyles.buttonShadow,
            }}
          />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonHeader />
          <SkeletonInfoRows count={3} />
        </SkeletonCard>
      </div>
    </PageWrapper>
  );
}
