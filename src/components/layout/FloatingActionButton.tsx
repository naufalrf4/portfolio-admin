'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: import('react').ReactNode;
  label?: string;
  show?: boolean;
}

export function FloatingActionButton({
  onClick,
  icon,
  label = 'Add new item',
  show = true,
}: FloatingActionButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        'fixed bottom-28 right-6 z-30',
        'w-14 h-14 rounded-full',
        'bg-accent',
        'flex items-center justify-center',
        'text-accent-foreground',
        'shadow-surface-raised',
        'hover:scale-110 hover:shadow-surface-raised',
        'active:scale-95',
        'transition-all duration-300 ease-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50',
        'block md:hidden',
      ].join(' ')}
    >
      {icon || <Plus className="w-6 h-6" strokeWidth={2.5} />}
    </button>
  );
}
