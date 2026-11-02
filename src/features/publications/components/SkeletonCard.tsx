import { SURFACE_STYLES } from '../constants/publications.constants';

export function SkeletonCard() {
  return (
    <div
      className="rounded-[var(--radius-container)] p-6 animate-pulse"
      style={{
        backgroundColor: SURFACE_STYLES.background,
        boxShadow: SURFACE_STYLES.shadows.inset,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl"
          style={{
            backgroundColor: SURFACE_STYLES.background,
            boxShadow: SURFACE_STYLES.shadows.insetDeep,
          }}
        />
        <div className="flex-1 space-y-3">
          <div
            className="h-5 w-3/4 rounded-lg"
            style={{
              backgroundColor: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          />
          <div
            className="h-4 w-1/2 rounded-lg"
            style={{
              backgroundColor: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          />
          <div
            className="h-6 w-20 rounded-full"
            style={{
              backgroundColor: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div
          className="h-8 w-16 rounded-full"
          style={{
            backgroundColor: SURFACE_STYLES.background,
            boxShadow: SURFACE_STYLES.shadows.inset,
          }}
        />
        <div className="flex gap-2">
          <div
            className="h-8 w-8 rounded-xl"
            style={{
              backgroundColor: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          />
          <div
            className="h-8 w-8 rounded-xl"
            style={{
              backgroundColor: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          />
        </div>
      </div>
    </div>
  );
}
