import { ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LogsEmptyState({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30 text-[var(--text-secondary)] mb-4">
        <ScrollText className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        No Application Logs
      </h3>
      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
        No log entries match your current filter criteria, or no logs have been recorded yet.
      </p>
    </Card>
  );
}
