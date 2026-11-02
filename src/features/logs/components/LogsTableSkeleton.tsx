import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function LogsTableSkeleton({ rowCount = 5, className }: { rowCount?: number; className?: string }) {
  return (
    <Card
      className={cn(
        'rounded-2xl overflow-hidden bg-[var(--bg-elevated)] surface-raised-sm border border-border/40',
        className
      )}
    >
      <div className="border-b border-border/40 p-4 bg-muted/20 flex gap-4">
        <Skeleton className="h-4 w-28 bg-muted/60" />
        <Skeleton className="h-4 w-16 bg-muted/60" />
        <Skeleton className="h-4 w-24 bg-muted/60" />
        <Skeleton className="h-4 flex-1 bg-muted/60" />
      </div>
      <div className="divide-y divide-border/20">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <Skeleton className="h-4 w-32 bg-muted/40" />
            <Skeleton className="h-5 w-14 bg-muted/40" />
            <Skeleton className="h-4 w-24 bg-muted/40" />
            <Skeleton className="h-4 flex-1 bg-muted/40" />
          </div>
        ))}
      </div>
    </Card>
  );
}
