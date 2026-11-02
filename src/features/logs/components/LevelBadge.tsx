import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LogLevel } from '../types/logs.types';

interface LevelBadgeProps {
  level: LogLevel;
  className?: string;
}

const LEVEL_CONFIG: Record<
  LogLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  debug: {
    label: 'DEBUG',
    bg: 'bg-muted/40',
    text: 'text-[var(--text-secondary)]',
    border: 'border-border/40',
  },
  info: {
    label: 'INFO',
    bg: 'bg-[var(--teal)]/10',
    text: 'text-[var(--teal)]',
    border: 'border-[var(--teal)]/20',
  },
  warn: {
    label: 'WARN',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  },
  error: {
    label: 'ERROR',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
};

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.info;

  return (
    <Badge
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wide uppercase border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
