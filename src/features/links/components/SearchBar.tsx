import { Input } from '@/components/ui/input';
import { Search, X, Grid3X3, List } from 'lucide-react';
import type { ViewMode } from '../types/links.types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SearchBar({ searchQuery, onSearchChange, viewMode, onViewModeChange }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
        <Input
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div
        className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)]"
        style={{
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        }}
      >
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2.5 rounded-lg transition-all duration-200 ${
            viewMode === 'grid'
              ? 'bg-[var(--bg-elevated)] shadow-surface-raised-sm text-[var(--teal)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Grid3X3 className="h-5 w-5" />
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-2.5 rounded-lg transition-all duration-200 ${
            viewMode === 'table'
              ? 'bg-[var(--bg-elevated)] shadow-surface-raised-sm text-[var(--teal)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
