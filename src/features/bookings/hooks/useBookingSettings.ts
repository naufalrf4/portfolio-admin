'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type { BookingSettings, GoogleCalendarOption } from '../types/bookings.types';

const BOOKING_SETTINGS_ENDPOINT = '/api/v1/admin/booking-settings';
const GOOGLE_CALENDARS_ENDPOINT = '/api/v1/admin/booking-settings/google/calendars';
const GOOGLE_DISCONNECT_ENDPOINT = '/api/v1/admin/booking-settings/google/disconnect';

type UseBookingSettingsResult = {
  settings: BookingSettings | null;
  calendars: GoogleCalendarOption[];
  loading: boolean;
  saving: boolean;
  calendarsLoading: boolean;
  refetch: () => Promise<void>;
  refetchCalendars: () => Promise<void>;
  updateSettings: (
    data: Partial<BookingSettings>,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
  disconnectGoogleCalendar: () => Promise<boolean>;
};

export function useBookingSettings(): UseBookingSettingsResult {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendarsLoading, setCalendarsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(BOOKING_SETTINGS_ENDPOINT);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load booking settings');
      }

      setSettings(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load booking settings'));
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCalendars = useCallback(async () => {
    try {
      setCalendarsLoading(true);
      const response = await fetch(GOOGLE_CALENDARS_ENDPOINT);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load Google calendars');
      }

      setCalendars(Array.isArray(data.data?.items) ? data.data.items : []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load Google calendars'));
      setCalendars([]);
    } finally {
      setCalendarsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings?.googleCalendarConnected) {
      void fetchCalendars();
      return;
    }

    setCalendars([]);
  }, [fetchCalendars, settings?.googleCalendarConnected]);

  const updateSettings = useCallback(
    async (
      updateData: Partial<BookingSettings>,
      options?: { silent?: boolean }
    ): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await fetch(BOOKING_SETTINGS_ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to update booking settings');
        }

        setSettings(data.data);
        if (!options?.silent) {
          toast.success('Booking settings saved successfully');
        }
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update booking settings'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const disconnectGoogleCalendar = useCallback(async () => {
    try {
      setSaving(true);
      const response = await fetch(GOOGLE_DISCONNECT_ENDPOINT, { method: 'POST' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to disconnect Google Calendar');
      }

      setSettings(data.data);
      setCalendars([]);
      toast.success('Google Calendar disconnected');
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to disconnect Google Calendar'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    calendars,
    loading,
    saving,
    calendarsLoading,
    refetch: fetchSettings,
    refetchCalendars: fetchCalendars,
    updateSettings,
    disconnectGoogleCalendar,
  };
}
