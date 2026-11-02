'use client';

import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface DetailFieldProps {
  label: string;
  value: ReactNode;
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div
      className="rounded-xl p-3 bg-[var(--bg-elevated)]"
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Label className="text-[var(--text-secondary)] text-xs mb-1 block">{label}</Label>
      <p className="text-[var(--text-primary)] text-sm font-medium">{value}</p>
    </div>
  );
}
