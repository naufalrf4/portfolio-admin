import { SKELETON_COUNT } from '../constants/guestbook.constants';
import { SkeletonCard } from './SkeletonCard';

export function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(SKELETON_COUNT)].map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}
