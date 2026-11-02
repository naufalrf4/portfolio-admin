'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type { BookingSlot, BookingSettings } from '../types/bookings.types';
import {
  getWeekDates,
  formatDateShort,
  formatDateISO,
  formatDateFull,
  isThisWeek,
  dateKeyToInstant,
} from '../utils/dateUtils';
import { DayCard } from './DayCard';
import { SettingsCard } from './SettingsCard';
import { AddSlotModal } from './AddSlotModal';
import { BulkAddModal } from './BulkAddModal';
import { logger } from '@/lib/utils/logger';
import { addDaysToDateKey, getJakartaDateKey } from '@/lib/utils/date';

export function AvailabilityTab() {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [settings, setSettings] = useState<BookingSettings>({
    timezone: 'Asia/Jakarta',
    notificationEmail: null,
    reminderEnabled: true,
    reminderDay: 6,
    reminderTime: '09:00',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(() => getJakartaDateKey());

  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isDeleteSlotModalOpen, setIsDeleteSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BookingSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<BookingSlot | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  const weekData = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = weekData.startKey;
      const endDate = weekData.endKey;

      const [slotsRes, settingsRes] = await Promise.all([
        fetch(`/api/v1/admin/booking-slots?startDate=${startDate}&endDate=${endDate}`),
        fetch('/api/v1/admin/booking-settings'),
      ]);

      const slotsData = await slotsRes.json();
      const settingsData = await settingsRes.json();

      if (slotsData.success && Array.isArray(slotsData.data)) {
        setSlots(slotsData.data);
      } else if (slotsData.success && slotsData.data?.slots) {
        setSlots(slotsData.data.slots);
      } else {
        logger.warn('⚠️ Unexpected API response', { slotsData });
        setSlots([]);
      }

      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load availability data'));
    } finally {
      setLoading(false);
    }
  }, [weekData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const payload = {
        ...settings,
        notificationEmail: settings.notificationEmail?.trim() || null,
      };

      const response = await fetch('/api/v1/admin/booking-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        const errorMessage =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to save settings';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save settings'));
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleCopyFromLastWeek() {
    try {
      const response = await fetch('/api/v1/admin/booking-slots/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceStartDate: addDaysToDateKey(weekData.startKey, -7),
          targetStartDate: weekData.startKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Slots copied from last week');
        fetchData();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to copy slots';
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to copy slots'));
    }
  }

  async function handleToggleSlotStatus(slot: BookingSlot) {
    if (slot.status === 'BOOKED') {
      toast.error('Cannot modify a booked slot');
      return;
    }

    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';

    try {
      const response = await fetch(`/api/v1/admin/booking-slots/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Slot ${newStatus.toLowerCase()}`);
        fetchData();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update slot';
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update slot'));
    }
  }

  async function handleDeleteSlot() {
    if (!deletingSlot) return;

    try {
      const response = await fetch(`/api/v1/admin/booking-slots/${deletingSlot.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Slot deleted successfully');
        setIsDeleteSlotModalOpen(false);
        fetchData();
      } else {
        let errorMsg = 'Failed to delete slot';
        if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (data.error?.message) {
          errorMsg = data.error.message;
        } else if (data.error?._errors && Array.isArray(data.error._errors)) {
          errorMsg = data.error._errors[0] || errorMsg;
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete slot'));
    }
  }

  function navigateWeek(direction: 'prev' | 'next') {
    setCurrentWeek(addDaysToDateKey(currentWeek, direction === 'next' ? 7 : -7));
  }

  function goToThisWeek() {
    setCurrentWeek(getJakartaDateKey());
  }

  function openAddSlotModal(date?: string) {
    setPrefilledDate(date || null);
    setEditingSlot(null);
    setIsAddSlotModalOpen(true);
  }

  function openEditSlotModal(slot: BookingSlot) {
    setEditingSlot(slot);
    setPrefilledDate(null);
    setIsAddSlotModalOpen(true);
  }

  function openDeleteSlotModal(slot: BookingSlot) {
    setDeletingSlot(slot);
    setIsDeleteSlotModalOpen(true);
  }

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, BookingSlot[]> = {};
    const slotsArray = Array.isArray(slots) ? slots : [];

    slotsArray.forEach((slot) => {
      if (!slot || !slot.date) {
        logger.warn('⚠️ Invalid slot', { slot });
        return;
      }

      const date = slot.date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const aTime = a.startTime || '';
        const bTime = b.startTime || '';
        return aTime.localeCompare(bTime);
      });
    });

    return grouped;
  }, [slots]);

  const isCurrentWeekThisWeek = useMemo(() => isThisWeek(weekData.start), [weekData]);

  return (
    <div className="space-y-6">
      <SettingsCard
        settings={settings}
        onChange={setSettings}
        onSave={handleSaveSettings}
        saving={savingSettings}
      />

      <div
        className="rounded-[var(--radius-container)] p-6 bg-[var(--bg-elevated)]"
        style={{
          boxShadow:
            '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {formatDateShort(weekData.start)} - {formatDateShort(weekData.end)},{' '}
                {weekData.startKey.slice(0, 4)}
              </h2>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {!isCurrentWeekThisWeek && (
              <Button variant="outline" size="sm" onClick={goToThisWeek}>
                This Week
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCopyFromLastWeek} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Copy from Last Week</span>
              <span className="sm:hidden">Copy Last Week</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsBulkAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Layers className="h-4 w-4 mr-2" />
              Bulk Add Slots
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[var(--text-secondary)]">Loading availability...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekData.days.map((day) => {
              const dateStr = formatDateISO(day);
              const daySlots = slotsByDate[dateStr] || [];
              const isTodayDate = getJakartaDateKey() === dateStr;

              return (
                <DayCard
                  key={dateStr}
                  date={day}
                  slots={daySlots}
                  isToday={isTodayDate}
                  onAddSlot={() => openAddSlotModal(dateStr)}
                  onEditSlot={openEditSlotModal}
                  onDeleteSlot={openDeleteSlotModal}
                  onToggleStatus={handleToggleSlotStatus}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddSlotModal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        onSuccess={() => {
          setIsAddSlotModalOpen(false);
          fetchData();
        }}
        slot={editingSlot}
        prefilledDate={prefilledDate}
      />

      <BulkAddModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onSuccess={() => {
          setIsBulkAddModalOpen(false);
          fetchData();
        }}
        weekDates={weekData.days}
      />

      <ResponsiveModal
        open={isDeleteSlotModalOpen}
        onOpenChange={setIsDeleteSlotModalOpen}
        title="Delete Time Slot"
        description={
          deletingSlot
            ? `Are you sure you want to delete the slot on ${formatDateFull(dateKeyToInstant(deletingSlot.date))} at ${deletingSlot.startTime}?`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Delete
            </Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-[var(--text-secondary)]">This action cannot be undone.</p>
        </div>
      </ResponsiveModal>

      <button
        onClick={() => openAddSlotModal()}
        className="fixed bottom-6 right-6 md:hidden p-4 rounded-full bg-[var(--teal)] text-on-accent shadow-lg hover:bg-accent transition-colors z-50"
        style={{
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
        }}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
