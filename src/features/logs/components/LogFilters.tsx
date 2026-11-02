import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { LogFilters as LogFiltersType, LogLevel, LogService } from '../types/logs.types';

interface LogFiltersProps {
  filters: LogFiltersType;
  onChange: (update: LogFiltersType | ((prev: LogFiltersType) => LogFiltersType)) => void;
  onReset: () => void;
  className?: string;
}

const LOG_LEVELS: Array<{ value: LogLevel; label: string }> = [
  { value: 'debug', label: 'DEBUG' },
  { value: 'info', label: 'INFO' },
  { value: 'warn', label: 'WARN' },
  { value: 'error', label: 'ERROR' },
];

const LOG_SERVICES: Array<{ value: LogService; label: string }> = [
  { value: 'admin', label: 'admin' },
  { value: 'public-astro', label: 'public-astro' },
  { value: 'links-astro', label: 'links-astro' },
  { value: 'ngl-svelte', label: 'ngl-svelte' },
  { value: 'rag-service', label: 'rag-service' },
];

export function LogFilters({ filters, onChange, onReset, className }: LogFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.level || filters.service || filters.message || filters.correlationId
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl p-4 bg-[var(--bg-elevated)] surface-raised-sm',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] pointer-events-none" />
          <Input
            type="text"
            placeholder="Search message text..."
            value={filters.message || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({
                ...prev,
                ...(val ? { message: val } : {}),
                ...(!val ? { message: undefined } : {}),
              }));
            }}
            className="h-10 rounded-xl pl-9 text-sm"
          />
        </div>

        <div className="min-w-[160px]">
          <Input
            type="text"
            placeholder="Correlation ID..."
            value={filters.correlationId || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({
                ...prev,
                ...(val ? { correlationId: val } : {}),
                ...(!val ? { correlationId: undefined } : {}),
              }));
            }}
            className="h-10 rounded-xl text-sm"
          />
        </div>

        <Select
          value={filters.level ?? 'all'}
          onValueChange={(value) => {
            const level = LOG_LEVELS.find((option) => option.value === value)?.value;
            onChange((prev) => ({
              ...prev,
              ...(level ? { level } : { level: undefined }),
            }));
          }}
        >
          <SelectTrigger size="sm" className="w-36 rounded-xl">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value="all">All Levels</SelectItem>
            {LOG_LEVELS.map((lvl) => (
              <SelectItem key={lvl.value} value={lvl.value}>
                {lvl.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.service ?? 'all'}
          onValueChange={(value) => {
            const service = LOG_SERVICES.find((option) => option.value === value)?.value;
            onChange((prev) => ({
              ...prev,
              ...(service ? { service } : { service: undefined }),
            }));
          }}
        >
          <SelectTrigger size="sm" className="w-44 rounded-xl">
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value="all">All Services</SelectItem>
            {LOG_SERVICES.map((srv) => (
              <SelectItem key={srv.value} value={srv.value}>
                {srv.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-3 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
