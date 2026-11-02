import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-surface-raised',
        primary: 'bg-[var(--teal)]/10 text-[var(--teal)] border border-[var(--teal)]/20',
        success: 'bg-[var(--teal)]/10 text-[var(--teal)] border border-[var(--teal)]/20',
        warning: 'bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/20',
        destructive: 'bg-red-500/10 text-red-500 border border-red-500/20',
        outline:
          'bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-surface-sunken',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
