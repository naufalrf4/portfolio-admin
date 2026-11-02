'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SUNKEN_SHADOW } from '../constants';
import type { StatCardProps } from '../types';

export function StatCard({
  icon,
  iconColor,
  tone,
  title,
  total,
  primaryStat,
  secondaryStat,
  delay = 0,
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getVariantStyles = (variant: 'success' | 'warning' | 'muted') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'muted':
        return 'bg-slate-400';
    }
  };

  const TONE_TINT_CLASS: Record<StatCardProps['tone'], string> = {
    blue: 'tile-tint-blue',
    purple: 'tile-tint-purple',
    emerald: 'tile-tint-emerald',
    amber: 'tile-tint-amber',
  };

  return (
    <Card
      data-hoverable="true"
      className={`p-4 lg:p-6 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="space-y-3 lg:space-y-0 lg:flex lg:items-start lg:gap-5">
        <div className="flex items-center justify-between lg:block lg:flex-none">
          <div
            className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 ${TONE_TINT_CLASS[tone]}`}
            style={{ boxShadow: SUNKEN_SHADOW }}
          >
            <div className={iconColor}>{icon}</div>
          </div>
          <p className="text-2xl lg:hidden font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-plus-jakarta)]">
            {total}
          </p>
        </div>

        <div className="lg:flex-1 lg:min-w-0">
          <p className="text-xs lg:text-sm font-medium text-[var(--text-secondary)] mb-1 lg:mb-1">{title}</p>
          <p className="hidden lg:block text-3xl font-bold text-[var(--text-primary)] tracking-tight font-[family-name:var(--font-plus-jakarta)]">
            {total}
          </p>

          {primaryStat && (
            <div className="flex items-center gap-1.5 lg:gap-4 lg:mt-3">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${getVariantStyles(primaryStat.variant)}`}
                />
                <span className="text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{primaryStat.value}</span>{' '}
                  {primaryStat.label}
                </span>
              </div>
              {secondaryStat && (
                <div className="hidden lg:flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${getVariantStyles(secondaryStat.variant)}`}
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">{secondaryStat.value}</span>{' '}
                    {secondaryStat.label}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
