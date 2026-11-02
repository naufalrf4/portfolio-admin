import { Card } from '@/components/ui/card';
import { Inbox } from 'lucide-react';
import { SUNKEN_SHADOW } from '../constants';

export function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div
        className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center tile-tint-blue"
        style={{ boxShadow: SUNKEN_SHADOW }}
      >
        <Inbox className="w-10 h-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-[family-name:var(--font-plus-jakarta)]">
        Welcome to your dashboard!
      </h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        Your portfolio activity and interactions will appear here.
      </p>
    </Card>
  );
}
