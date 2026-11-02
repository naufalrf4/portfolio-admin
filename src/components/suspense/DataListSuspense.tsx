import { Suspense, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DataListSuspenseProps {
  children: ReactNode;
  count?: number;
}

export function DataListSuspense({ children, count = 6 }: DataListSuspenseProps) {
  return <Suspense fallback={<DataListSkeleton count={count} />}>{children}</Suspense>;
}

function DataListSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-full bg-bg-elevated" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-lg bg-bg-elevated" />
                  <Skeleton className="h-3 w-1/2 rounded-lg bg-bg-elevated" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-lg bg-bg-elevated" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg bg-bg-elevated" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 rounded-lg bg-bg-elevated" />
              <Skeleton className="h-6 w-16 rounded-full bg-bg-elevated" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
