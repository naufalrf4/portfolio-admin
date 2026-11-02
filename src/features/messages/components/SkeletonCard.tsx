import { SURFACE_SHADOWS, COLORS } from '../constants/messages.constants';

export function SkeletonCard() {
  return (
    <div
      className="rounded-[var(--radius-container)] p-6 animate-pulse"
      style={{
        backgroundColor: COLORS.background,
        boxShadow: SURFACE_SHADOWS.extruded,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full"
          style={{
            backgroundColor: COLORS.background,
            boxShadow: SURFACE_SHADOWS.inset,
          }}
        />
        <div className="flex-1 space-y-3">
          <div
            className="h-4 rounded-full w-3/4"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.insetSm,
            }}
          />
          <div
            className="h-4 rounded-full w-1/2"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.insetSm,
            }}
          />
          <div
            className="h-3 rounded-full w-1/4"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.insetSm,
            }}
          />
        </div>
      </div>
    </div>
  );
}
