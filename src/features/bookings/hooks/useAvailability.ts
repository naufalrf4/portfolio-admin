'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type {
  BookingSlot,
  BookingSettings,
  CreateSlotInput,
  UpdateSlotInput,
  BulkCreateSlotsInput,
  UseAvailabilityOptions,
  UseAvailabilityResult,
} from '../types/bookings.types';
import { getWeekDates } from '../utils/dateUtils';

const SLOTS_ENDPOINT = '/api/v1/admin/booking-slots';
const SETTINGS_ENDPOINT = '/api/v1/admin/booking-settings';

export function useAvailability(options: UseAvailabilityOptions = {}): UseAvailabilityResult {
  const { enabled = true, startDate, endDate } = options;

  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }
    const weekData = getWeekDates();
    return {
      start: weekData.startKey,
      end: weekData.endKey,
    };
  }, [startDate, endDate]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const [slotsRes, settingsRes] = await Promise.all([
        fetch(`${SLOTS_ENDPOINT}?startDate=${dateRange.start}&endDate=${dateRange.end}`),
        fetch(SETTINGS_ENDPOINT),
      ]);

      const slotsData = await slotsRes.json();
      const settingsData = await settingsRes.json();

      if (slotsData.success && slotsData.data) {
        setSlots(slotsData.data);
      }

      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(getErrorMessage(err, 'Failed to load availability data'));
    } finally {
      setLoading(false);
    }
  }, [enabled, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createSlot = useCallback(
    async (input: CreateSlotInput): Promise<boolean> => {
      try {
        const response = await fetch(SLOTS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...input,
            status: input.status || 'AVAILABLE',
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Slot created successfully');
          await fetchData();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to create slot';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to create slot'));
        return false;
      }
    },
    [fetchData]
  );

  const updateSlot = useCallback(
    async (id: string, input: UpdateSlotInput): Promise<boolean> => {
      try {
        const response = await fetch(`${SLOTS_ENDPOINT}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Slot updated successfully');
          await fetchData();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update slot';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update slot'));
        return false;
      }
    },
    [fetchData]
  );

  const deleteSlot = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${SLOTS_ENDPOINT}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Slot deleted successfully');
          await fetchData();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete slot';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete slot'));
        return false;
      }
    },
    [fetchData]
  );

  const toggleSlotStatus = useCallback(
    async (slot: BookingSlot): Promise<boolean> => {
      if (slot.status === 'BOOKED') {
        toast.error('Cannot modify a booked slot');
        return false;
      }

      const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
      return updateSlot(slot.id, { status: newStatus });
    },
    [updateSlot]
  );

  const bulkCreateSlots = useCallback(
    async (input: BulkCreateSlotsInput): Promise<boolean> => {
      try {
        const response = await fetch(`${SLOTS_ENDPOINT}/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (data.success) {
          toast.success(`Created ${input.slots.length} slots successfully`);
          await fetchData();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to create slots';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to create slots'));
        return false;
      }
    },
    [fetchData]
  );

  const copyFromLastWeek = useCallback(
    async (sourceStartDate: string, targetStartDate: string): Promise<boolean> => {
      try {
        const response = await fetch(`${SLOTS_ENDPOINT}/copy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceStartDate, targetStartDate }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Slots copied from last week');
          await fetchData();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to copy slots';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to copy slots'));
        return false;
      }
    },
    [fetchData]
  );

  const saveSettings = useCallback(
    async (settingsUpdate: Partial<BookingSettings>): Promise<boolean> => {
      try {
        const response = await fetch(SETTINGS_ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsUpdate),
        });

        const data = await response.json();

        if (data.success) {
          setSettings(data.data);
          toast.success('Settings saved successfully');
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to save settings';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to save settings'));
        return false;
      }
    },
    []
  );

  return {
    slots,
    settings,
    loading,
    error,
    refetch: fetchData,
    createSlot,
    updateSlot,
    deleteSlot,
    toggleSlotStatus,
    bulkCreateSlots,
    copyFromLastWeek,
    saveSettings,
  };
}
