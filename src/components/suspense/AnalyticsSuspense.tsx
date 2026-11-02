import { Suspense, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsSuspenseProps {
  children: ReactNode;
}

export function AnalyticsSuspense({ children }: AnalyticsSuspenseProps) {
  return <Suspense fallback={<AnalyticsSkeleton />}>{children}</Suspense>;
}

function AnalyticsSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl bg-bg-elevated" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg bg-bg-elevated" />
            <Skeleton className="h-8 w-24 rounded-lg bg-bg-elevated" />
          </div>
        </div>
        <Skeleton className="h-16 w-64 rounded-lg bg-bg-elevated" />
      </div>
    </Card>
  );
}
