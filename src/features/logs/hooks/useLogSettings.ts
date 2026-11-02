'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type {
  LogCaptureSettings,
  UpdateLogCaptureSettingsInput,
} from '../types/logs.types';

interface UseLogSettingsReturn {
  settings: LogCaptureSettings | null;
  loading: boolean;
  saving: boolean;
  updateSettings: (input: UpdateLogCaptureSettingsInput) => Promise<boolean>;
  refresh: () => void;
}

export function useLogSettings(): UseLogSettingsReturn {
  const [settings, setSettings] = useState<LogCaptureSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSettings = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/log-settings', {
        signal: controller.signal,
      });
      const json = await res.json();

      if (json.success && json.data) {
        setSettings(json.data);
      } else {
        toast.error('Failed to load log settings');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to load log settings');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (input: UpdateLogCaptureSettingsInput): Promise<boolean> => {
      if (!settings) return false;

      const previousSettings = { ...settings };
      const optimisticSettings: LogCaptureSettings = {
        ...settings,
        ...(input.minLevel !== undefined ? { minLevel: input.minLevel } : {}),
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.serviceOverrides !== undefined
          ? { serviceOverrides: input.serviceOverrides }
          : {}),
        ...(input.retentionDays !== undefined
          ? { retentionDays: input.retentionDays }
          : {}),
      };

      setSettings(optimisticSettings);
      setSaving(true);

      try {
        const body: Record<string, unknown> = {};
        if (input.minLevel !== undefined) body.minLevel = input.minLevel;
        if (input.enabled !== undefined) body.enabled = input.enabled;
        if (input.serviceOverrides !== undefined) body.serviceOverrides = input.serviceOverrides;
        if (input.retentionDays !== undefined) body.retentionDays = input.retentionDays;

        const res = await fetch('/api/v1/admin/log-settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const json = await res.json();

        if (json.success && json.data) {
          setSettings(json.data);
          toast.success('Log settings updated');
          return true;
        } else {
          setSettings(previousSettings);
          toast.error(json.message || 'Failed to update log settings');
          return false;
        }
      } catch {
        setSettings(previousSettings);
        toast.error('Failed to update log settings');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refresh: fetchSettings,
  };
}
