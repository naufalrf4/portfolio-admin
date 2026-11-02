import { Eye, EyeOff } from 'lucide-react';
import type { FilterMode } from '../types/links.types';

interface FilterButtonsProps {
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  stats: {
    total: number;
    visible: number;
    hidden: number;
  };
}

export function FilterButtons({ filterMode, onFilterChange, stats }: FilterButtonsProps) {
  return (
    <div
      className="flex flex-wrap gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)]"
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          filterMode === 'all'
            ? 'bg-[var(--bg-elevated)] shadow-surface-raised-sm text-[var(--teal)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        All ({stats.total})
      </button>
      <button
        onClick={() => onFilterChange('visible')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
          filterMode === 'visible'
            ? 'bg-[var(--bg-elevated)] shadow-surface-raised-sm text-[var(--teal)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Eye className="h-4 w-4" />
        Visible ({stats.visible})
      </button>
      <button
        onClick={() => onFilterChange('hidden')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
          filterMode === 'hidden'
            ? 'bg-[var(--bg-elevated)] shadow-surface-raised-sm text-[var(--text-secondary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <EyeOff className="h-4 w-4" />
        Hidden ({stats.hidden})
      </button>
    </div>
  );
}
