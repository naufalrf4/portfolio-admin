import { SURFACE_STYLES } from '../constants/guestbook.constants';
import { BookOpenIcon } from './Icons';
import type { FilterType } from '../types/guestbook.types';

interface EmptyStateProps {
  filter: FilterType;
}

export function EmptyState({ filter }: EmptyStateProps) {
  const getMessage = () => {
    if (filter === 'all') {
      return 'When visitors leave messages in your guestbook, they will appear here.';
    }
    if (filter === 'visible') {
      return 'No visible entries found. Toggle some entries to make them visible.';
    }
    return 'No hidden entries found. All entries are currently visible.';
  };

  return (
    <div
      className="rounded-[var(--radius-container)] p-12 text-center"
      style={{
        background: SURFACE_STYLES.background,
        boxShadow: SURFACE_STYLES.shadows.extruded,
      }}
    >
      <div
        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{
          background: SURFACE_STYLES.background,
          boxShadow: SURFACE_STYLES.shadows.inset,
        }}
      >
        <BookOpenIcon />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: SURFACE_STYLES.foreground }}>
        No guestbook entries yet
      </h3>
      <p className="max-w-md mx-auto" style={{ color: SURFACE_STYLES.muted }}>
        {getMessage()}
      </p>
    </div>
  );
}
