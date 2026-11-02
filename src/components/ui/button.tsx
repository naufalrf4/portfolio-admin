import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium rounded-2xl',
    'transition-all duration-300 ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    'shrink-0 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--bg-elevated)] text-[var(--text-primary)]',
          'shadow-surface-raised',
          'hover:translate-y-[-1px]',
          'hover:shadow-surface-raised',
          'active:translate-y-[0.5px]',
          'active:shadow-surface-sunken',
        ].join(' '),
        primary: [
          'bg-[var(--teal)] text-on-accent',
          'shadow-surface-raised',
          'hover:translate-y-[-1px] hover:brightness-110',
          'hover:shadow-surface-raised',
          'active:translate-y-[0.5px] active:brightness-95',
          'active:shadow-surface-sunken',
        ].join(' '),
        destructive: [
          'bg-[var(--error)] text-on-error',
          'shadow-surface-raised',
          'hover:translate-y-[-1px] hover:brightness-110',
          'hover:shadow-surface-raised',
          'active:translate-y-[0.5px] active:brightness-95',
          'active:shadow-surface-sunken',
        ].join(' '),
        outline: [
          'bg-transparent border border-line-strong text-foreground',
          'shadow-surface-raised',
          'hover:bg-[var(--bg-elevated)] hover:translate-y-[-1px]',
          'hover:shadow-surface-raised',
          'active:translate-y-[0.5px]',
          'active:shadow-surface-sunken',
        ].join(' '),
        ghost: [
          'bg-transparent shadow-none',
          'hover:bg-[var(--bg-elevated)]/50',
          'active:bg-[var(--bg-elevated)]/70',
        ].join(' '),
        link: [
          'bg-transparent shadow-none text-[var(--teal)]',
          'underline-offset-4 hover:underline',
          'p-0 h-auto',
        ].join(' '),
      },
      size: {
        default: 'h-11 px-6 py-2 text-sm',
        sm: 'h-9 px-4 text-sm rounded-xl',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9 rounded-xl',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps extends React.ComponentProps<'button'>, ButtonVariants {
  asChild?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps, ButtonVariants };
