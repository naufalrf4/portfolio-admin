import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SUNKEN_SHADOW } from '../constants';

export function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-5">
        <Skeleton
          className="w-14 h-14 rounded-2xl tile-tint-blue"
          style={{ boxShadow: SUNKEN_SHADOW }}
        />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24 rounded-lg bg-bg-elevated" />
          <Skeleton className="h-8 w-16 rounded-lg bg-bg-elevated" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20 rounded-lg bg-bg-elevated" />
            <Skeleton className="h-3 w-20 rounded-lg bg-bg-elevated" />
          </div>
        </div>
      </div>
    </Card>
  );
}
