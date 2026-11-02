import { Eye, EyeOff, Star, Grid3x3, List, Search } from './Icons';
import { Input } from '@/components/ui/input';
import type { FilterMode, ViewMode } from '../types/projects.types';

interface ProjectFiltersProps {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const filterButtons = [
  { mode: 'all' as const, label: 'All', icon: null },
  { mode: 'visible' as const, label: 'Visible', icon: Eye },
  { mode: 'hidden' as const, label: 'Hidden', icon: EyeOff },
  { mode: 'featured' as const, label: 'Featured', icon: Star },
];

export function ProjectFilters({
  filterMode,
  setFilterMode,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
}: ProjectFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filterMode === mode
                  ? 'bg-[var(--teal)] text-on-accent shadow-surface-raised-sm'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-surface-raised-sm hover:shadow-surface-sunken'
              }`}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'grid'
                ? 'bg-[var(--teal)] text-on-accent'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)]'
            }`}
            style={{
              boxShadow:
                viewMode === 'grid'
                  ? '0 2px 8px -2px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'table'
                ? 'bg-[var(--teal)] text-on-accent'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)]'
            }`}
            style={{
              boxShadow:
                viewMode === 'table'
                  ? '0 2px 8px -2px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
        />
      </div>
    </div>
  );
}
