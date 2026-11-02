'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer h-5 w-5 shrink-0 rounded-lg',
        'bg-[var(--bg-elevated)]',
        'transition-all duration-300 ease-out',
        'outline-none',
        'shadow-surface-sunken',
        'data-[state=checked]:bg-[var(--teal)]',
        'data-[state=checked]:shadow-surface-raised',
        'focus-visible:ring-2 focus-visible:ring-[var(--teal)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn('flex items-center justify-center text-on-accent')}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
