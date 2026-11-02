import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full rounded-2xl bg-[var(--bg-card)] px-4 py-3',
        'text-base text-[var(--text-primary)]',
        'border border-line-strong outline-none',
        'transition-all duration-300 ease-out',
        'shadow-surface-sunken',
        'placeholder:text-[var(--text-secondary)] placeholder:opacity-70',
        'focus:ring-2 focus:ring-[var(--teal)]/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)]',
        'focus:shadow-surface-sunken',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-card)]/80',
        'file:border-none file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]',
        'file:mr-4 file:rounded-xl file:px-4 file:py-2',
        'file:transition-all file:duration-300',
        'file:hover:bg-bg-elevated',
        '[&:-webkit-autofill]:bg-[var(--bg-card)]',
        '[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_var(--bg-elevated)_inset]',
        '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--text-primary)]',
        'aria-invalid:ring-2 aria-invalid:ring-destructive/30',
        'selection:bg-[var(--teal)]/20 selection:text-[var(--text-primary)]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
