'use client';
import { useEffect, useState } from 'react';
import { formatJakartaTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
const SHOW_SECONDS = true;
const TICK_INTERVAL_MS = SHOW_SECONDS ? 1000 : 60000;
const PLACEHOLDER = SHOW_SECONDS ? '--:--:-- WIB' : '--:-- WIB';
export function WibClock({ className }: {
    className?: string;
}) {
    const [mounted, setMounted] = useState(false);
    const [time, setTime] = useState(PLACEHOLDER);
    useEffect(() => {
        setMounted(true);
        const tick = () => setTime(formatJakartaTime(new Date(), SHOW_SECONDS));
        tick();
        const interval = setInterval(tick, TICK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);
    return (<div className={cn('hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5', 'bg-[var(--bg-card)] surface-raised-sm', className)} aria-hidden={!mounted}>
      <span className="font-mono text-xs font-medium tabular-nums tracking-wide text-[var(--text-secondary)]" suppressHydrationWarning>
        {mounted ? time : PLACEHOLDER}
      </span>
    </div>);
}
