'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

interface CountryDistributionProps {
  data?: Array<{ country: string; code: string; count: number; percentage: number }>;
  loading?: boolean;
}

export function CountryDistribution({ data, loading }: CountryDistributionProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          'p-6 bg-[var(--bg-elevated)]',
          'shadow-surface-raised'
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Geographic Distribution</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-line rounded-full animate-pulse" />
                    <div className="h-3 w-24 bg-line rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-12 bg-line rounded animate-pulse" />
                </div>
                <div className="h-2 bg-line rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const countriesData = data || [];
  return (
    <Card
      className={cn(
        'p-6 bg-[var(--bg-elevated)]',
        'shadow-surface-raised'
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Geographic Distribution</h3>
        <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
      </div>

      {countriesData.length > 0 ? (
        <div className="space-y-5">
          {countriesData.map((country) => (
            <div key={country.code} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFlagEmoji(country.code)}</span>
                  <span className="font-medium text-[var(--text-primary)]">{country.country}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {country.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{country.percentage}%</span>
                </div>
              </div>

              <div className="h-2 bg-line rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500 ease-out', 'bg-accent')}
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center">
          <Globe className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-[var(--text-secondary)] text-sm">No geographic data available</p>
        </div>
      )}
    </Card>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}
