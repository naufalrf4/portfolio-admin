import * as React from 'react';

import { cn } from '@/lib/utils';

function Card({ className, style, ...props }: React.ComponentProps<'div'>) {
  const isInset = className?.includes('card-inset');

  return (
    <div
      data-slot="card"
      className={cn(
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] flex flex-col rounded-[var(--radius-container)] transition-all duration-300 ease-out',
        'data-[hoverable=true]:hover:-translate-y-0.5 data-[hoverable=true]:cursor-pointer',
        '[&.card-inset]:rounded-2xl',
        isInset
          ? 'shadow-surface-sunken'
          : 'shadow-surface-raised data-[hoverable=true]:hover:shadow-surface-raised',
        className
      )}
      style={style}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header flex flex-col gap-1.5 p-6 pb-0',
        'has-data-[slot=card-action]:flex-row has-data-[slot=card-action]:items-start has-data-[slot=card-action]:justify-between',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-display font-bold text-xl text-[var(--text-primary)] tracking-tight leading-none',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-[var(--text-secondary)]', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-action" className={cn('self-end flex-shrink-0', className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-2 p-6 pt-0', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
