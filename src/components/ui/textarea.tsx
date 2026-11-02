import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex w-full min-h-[100px] rounded-2xl bg-[var(--bg-card)] px-4 py-3 text-base text-[var(--text-primary)]',
        'border border-line-strong outline-none',
        'placeholder:text-[var(--text-secondary)] placeholder:opacity-70',
        'resize-y',
        'transition-all duration-300 ease-out',
        'shadow-surface-sunken',
        'focus:ring-2 focus:ring-[var(--teal)]/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:resize-none',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
