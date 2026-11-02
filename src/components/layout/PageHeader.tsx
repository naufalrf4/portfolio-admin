'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PageHeaderBackNav {
  href: string;
  label?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: import('react').ReactNode;
  stats?: { label: string; value: string | number; variant?: 'default' | 'success' | 'warning' }[];
  className?: string;
  icon?: React.ReactElement<{ className?: string; strokeWidth?: number }>;
  back?: PageHeaderBackNav;
}

const SUNKEN_SHADOW =
  'inset 0 1px 4px rgba(0, 0, 0, 0.25)';

function PageHeader({ title, description, actions, stats, className, icon, back }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        'flex flex-col gap-4 md:gap-6',
        className
      )}
    >
      {back && (
        <div>
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{back.label ?? 'Back'}</span>
          </Link>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="flex-1 space-y-0.5 md:space-y-1">
          <div className="flex items-center gap-2 md:gap-3">
            {icon && (
              <div className="flex-shrink-0 text-[var(--text-primary)]">
                {React.cloneElement(icon, {
                  className: 'h-5 w-5 md:h-7 md:w-7',
                  strokeWidth: 2,
                })}
              </div>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm md:text-base text-[var(--text-secondary)] mt-0.5 md:mt-1">{description}</p>
          )}
        </div>

        {actions && <div className="hidden md:flex md:items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-[var(--bg-elevated)]"
          style={{ boxShadow: SUNKEN_SHADOW }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium',
                'transition-colors duration-200',
                stat.variant === 'success' && 'bg-[var(--teal)]/10 text-[var(--teal)]',
                stat.variant === 'warning' && 'bg-[var(--amber)]/10 text-[var(--amber)]',
                (!stat.variant || stat.variant === 'default') && 'bg-[var(--text-secondary)]/10 text-[var(--text-secondary)]'
              )}
            >
              <span className="text-xs font-normal opacity-80">{stat.label}:</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps, PageHeaderBackNav };
