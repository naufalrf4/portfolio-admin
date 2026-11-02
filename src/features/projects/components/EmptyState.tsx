import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  onCreate: () => void;
}

export function EmptyState({ hasFilters, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-[var(--text-secondary)] mb-4">{hasFilters ? 'No projects found' : 'No projects yet'}</p>
      {!hasFilters && (
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Project
        </Button>
      )}
    </div>
  );
}
