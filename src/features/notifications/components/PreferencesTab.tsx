'use client';

import { Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { NOTIFICATION_EVENT_TYPES } from '../constants/notifications.constants';
import type { NotificationPreference } from '../types/notifications.types';

interface PreferencesTabProps {
  readonly preferences: readonly NotificationPreference[];
  readonly loading: boolean;
  readonly savingKey: string | null;
  readonly isEnabled: (eventType: string, channel: 'telegram') => boolean;
  readonly toggle: (eventType: string, channel: 'telegram', enabled: boolean) => Promise<void>;
}

export function PreferencesTab({ preferences, loading, savingKey, isEnabled, toggle }: PreferencesTabProps) {
  const enabledCount = preferences.filter((preference) => preference.enabled).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Event preferences</h2>
        <p className="text-xs text-[var(--text-secondary)]">
          In-app and push always receive every event; these toggles only control Telegram ({enabledCount} enabled).
        </p>
      </div>

      <section className="shape-container overflow-hidden bg-[var(--bg-card)] surface-raised">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="skeleton-shimmer h-16 w-full" />)}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {NOTIFICATION_EVENT_TYPES.map((eventType) => {
              const key = `${eventType.value}:telegram`;
              const enabled = isEnabled(eventType.value, 'telegram');

              return (
                <div key={eventType.value} className="flex items-center gap-4 p-4">
                  <div className="shape-inner bg-[var(--teal)]/10 p-2 text-[var(--teal)]">
                    <Send className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{eventType.label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{eventType.description}</p>
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={savingKey === key}
                    aria-label={`Send ${eventType.label} to Telegram`}
                    onCheckedChange={(nextEnabled) => void toggle(eventType.value, 'telegram', nextEnabled)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
