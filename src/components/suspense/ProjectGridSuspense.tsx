import { Suspense, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectGridSuspenseProps {
  children: ReactNode;
  count?: number;
}

export function ProjectGridSuspense({ children, count = 6 }: ProjectGridSuspenseProps) {
  return <Suspense fallback={<ProjectGridSkeleton count={count} />}>{children}</Suspense>;
}

function ProjectGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4 rounded-lg bg-bg-elevated" />
              <Skeleton className="h-8 w-8 rounded-lg bg-bg-elevated" />
            </div>
            <Skeleton className="h-4 w-20 rounded-full bg-bg-elevated" />
            <Skeleton className="h-16 w-full rounded-lg bg-bg-elevated" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full bg-bg-elevated" />
              <Skeleton className="h-6 w-20 rounded-full bg-bg-elevated" />
              <Skeleton className="h-6 w-14 rounded-full bg-bg-elevated" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-24 rounded-lg bg-bg-elevated" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-bg-elevated" />
                <Skeleton className="h-8 w-8 rounded-lg bg-bg-elevated" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
