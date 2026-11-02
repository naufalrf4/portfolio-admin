'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('w-full space-y-6 animate-in fade-in duration-500', className)}>
      {children}
    </div>
  );
}
