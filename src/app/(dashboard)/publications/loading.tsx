import { PageWrapper } from '@/components/layout/PageWrapper';

const SURFACE_SHADOWS = {
  extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
  inset: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
};

export default function PublicationsLoading() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div
            className="h-9 w-48 rounded-2xl animate-pulse"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              boxShadow: SURFACE_SHADOWS.inset,
            }}
          />
          <div
            className="h-5 w-64 rounded-xl mt-2 animate-pulse"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              boxShadow: SURFACE_SHADOWS.inset,
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-[var(--radius-container)] p-6"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              boxShadow: SURFACE_SHADOWS.extruded,
            }}
          >
            <div className="space-y-4">
              <div
                className="h-6 w-3/4 rounded-xl animate-pulse"
                style={{
                  backgroundColor: 'var(--border)',
                  boxShadow: SURFACE_SHADOWS.inset,
                }}
              />
              <div
                className="h-4 w-full rounded-xl animate-pulse"
                style={{
                  backgroundColor: 'var(--border)',
                  boxShadow: SURFACE_SHADOWS.inset,
                }}
              />
              <div
                className="h-4 w-2/3 rounded-xl animate-pulse"
                style={{
                  backgroundColor: 'var(--border)',
                  boxShadow: SURFACE_SHADOWS.inset,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
