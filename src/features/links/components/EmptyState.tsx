import { Button } from '@/components/ui/button';
import { Link2, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasSearchQuery: boolean;
  searchQuery: string;
  onCreateClick: () => void;
}

export function EmptyState({
  hasSearchQuery,
  searchQuery: _searchQuery,
  onCreateClick,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-[var(--radius-container)] bg-[var(--bg-elevated)]"
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Link2 className="h-10 w-10 text-[var(--text-secondary)]" />
      </div>
      <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
        {hasSearchQuery ? 'No links found' : 'No profile links yet'}
      </h3>
      <p className="text-[var(--text-secondary)] mb-6 text-center max-w-md">
        {hasSearchQuery
          ? 'Try adjusting your search or filter criteria'
          : 'Create your first link to connect your social profiles'}
      </p>
      {!hasSearchQuery && (
        <Button variant="primary" onClick={onCreateClick} className="gap-2">
          <Plus className="h-5 w-5" />
          Add Link
        </Button>
      )}
    </div>
  );
}
