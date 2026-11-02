import { SURFACE_STYLES } from '../constants/projects.constants';

export function SkeletonCard() {
  return (
    <div
      className="rounded-[var(--radius-container)] p-6 bg-[var(--bg-elevated)] animate-pulse"
      style={{
        boxShadow: SURFACE_STYLES.shadows.extruded,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] mb-4"
        style={{
          boxShadow: SURFACE_STYLES.shadows.button,
        }}
      />
      <div className="h-6 bg-bg-elevated rounded-lg mb-2" />
      <div className="h-4 bg-bg-elevated rounded-lg mb-4 w-2/3" />
      <div className="h-16 bg-bg-elevated rounded-lg mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-bg-elevated rounded-full w-16" />
        <div className="h-8 bg-bg-elevated rounded-full w-16" />
        <div className="h-8 bg-bg-elevated rounded-full w-16" />
      </div>
    </div>
  );
}
