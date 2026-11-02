'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NotificationPreference, PreferenceChannel } from '../types/notifications.types';

interface UseNotificationPreferencesReturn {
  readonly preferences: readonly NotificationPreference[];
  readonly loading: boolean;
  readonly savingKey: string | null;
  isEnabled: (eventType: string, channel: PreferenceChannel) => boolean;
  toggle: (eventType: string, channel: PreferenceChannel, enabled: boolean) => Promise<void>;
  refresh: () => void;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<readonly NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/notifications/preferences');
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error?.message ?? 'Failed to load notification preferences');
        return;
      }

      setPreferences(json.data as readonly NotificationPreference[]);
    } catch {
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isEnabled = useCallback(
    (eventType: string, channel: PreferenceChannel) =>
      preferences.some(
        (item) => item.eventType === eventType && item.channel === channel && item.enabled
      ),
    [preferences]
  );

  const toggle = useCallback(
    async (eventType: string, channel: PreferenceChannel, enabled: boolean) => {
      const key = `${eventType}:${channel}`;
      setSavingKey(key);
      setPreferences((prev) =>
        prev.map((item) =>
          item.eventType === eventType && item.channel === channel ? { ...item, enabled } : item
        )
      );

      try {
        const res = await fetch('/api/v1/admin/notifications/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, channel, enabled }),
        });
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error?.message ?? 'Failed to save preference');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save preference');
        await load();
      } finally {
        setSavingKey(null);
      }
    },
    [load]
  );

  return {
    preferences,
    loading,
    savingKey,
    isEnabled,
    toggle,
    refresh: () => void load(),
  };
}
