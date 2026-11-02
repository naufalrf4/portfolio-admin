import { PageWrapper } from '@/components/layout/PageWrapper';
import { SkeletonCard } from './SkeletonCard';

export function LoadingState() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-2xl bg-[var(--bg-elevated)] shadow-surface-raised animate-pulse" />
          <div className="h-5 w-64 rounded-xl bg-[var(--bg-elevated)] shadow-surface-raised animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    </PageWrapper>
  );
}
