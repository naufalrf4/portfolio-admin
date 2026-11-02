import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function KnowledgeLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-5 w-72" />
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
