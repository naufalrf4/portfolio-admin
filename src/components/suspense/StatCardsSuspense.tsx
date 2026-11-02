import { Suspense, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardsSuspenseProps {
  children: ReactNode;
}

export function StatCardsSuspense({ children }: StatCardsSuspenseProps) {
  return <Suspense fallback={<StatCardsSkeleton />}>{children}</Suspense>;
}

function StatCardsSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start gap-5">
            <Skeleton className="w-14 h-14 rounded-2xl bg-bg-elevated" />
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
      ))}
    </div>
  );
}
