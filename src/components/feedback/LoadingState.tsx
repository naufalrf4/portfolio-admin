import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
interface SkeletonLineProps {
    w?: string;
    h?: string;
    className?: string;
}
export function SkeletonLine({ w = 'w-full', h = 'h-4', className }: SkeletonLineProps) {
    return <Skeleton className={cn(w, h, className)}/>;
}
export function SkeletonCard({ className, children, }: {
    className?: string;
    children?: React.ReactNode;
}) {
    return (<div className={cn('surface-card p-6 space-y-4', className)}>
      {children ?? (<>
          <SkeletonLine w="w-1/3" h="h-6"/>
          <SkeletonLine />
          <SkeletonLine w="w-2/3"/>
        </>)}
    </div>);
}
export function SkeletonGrid({ count = 6, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', className, }: {
    count?: number;
    cols?: string;
    className?: string;
}) {
    return (<div className={cn('grid gap-6', cols, className)}>
      {Array.from({ length: count }).map((_, index) => (<SkeletonCard key={index}/>))}
    </div>);
}
export function SkeletonTable({ rows = 5, cols = 4, className, }: {
    rows?: number;
    cols?: number;
    className?: string;
}) {
    return (<div className={cn('surface-card p-6 space-y-4', className)}>
      {Array.from({ length: rows }).map((_, row) => (<div key={row} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, col) => (<SkeletonLine key={col} w={col === 0 ? 'flex-1' : 'w-24'} h="h-10"/>))}
        </div>))}
    </div>);
}
export function SkeletonTabs({ count = 4, className }: {
    count?: number;
    className?: string;
}) {
    return (<div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: count }).map((_, index) => (<SkeletonLine key={index} w="w-24" h="h-9"/>))}
    </div>);
}
