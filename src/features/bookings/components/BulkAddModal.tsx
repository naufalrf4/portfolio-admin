'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { toast } from 'sonner';
import { COMMON_TIMES, SHORT_DAY_NAMES } from '../constants';
import { formatDateISO, getDayOfMonth, getWeekdayIndex } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/errors';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  weekDates: Date[];
}

export function BulkAddModal({ isOpen, onClose, onSuccess, weekDates }: BulkAddModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDays([]);
      setSelectedTimes([]);
      setCustomTime('');
    }
  }, [isOpen]);

  function toggleDay(dayIndex: number) {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  }

  function toggleTime(time: string) {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  }

  function addCustomTime() {
    if (customTime && !selectedTimes.includes(customTime)) {
      setSelectedTimes((prev) => [...prev, customTime].sort());
      setCustomTime('');
    }
  }

  async function handleSubmit() {
    if (selectedDays.length === 0 || selectedTimes.length === 0) {
      toast.error('Please select at least one day and one time');
      return;
    }

    setSaving(true);
    try {
      const slots: { date: string; time: string; duration: number }[] = [];

      selectedDays.forEach((dayIndex) => {
        const date = weekDates[dayIndex];
        selectedTimes.forEach((time) => {
          slots.push({
            date: formatDateISO(date),
            time: time,
            duration: 60,
          });
        });
      });

      const response = await fetch('/api/v1/admin/booking-slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Created ${slots.length} slots successfully`);
        onSuccess();
      } else {
        toast.error(getErrorMessage(data.error, 'Failed to create slots'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create slots'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Bulk Add Slots"
      description="Create multiple slots at once for the selected week"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : `Create ${selectedDays.length * selectedTimes.length} Slots`}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Select Days</Label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const isSelected = selectedDays.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    isSelected ? 'bg-[var(--teal)] text-on-accent' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                      : '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="text-xs">{SHORT_DAY_NAMES[getWeekdayIndex(date)]}</div>
                  <div className="text-sm">{getDayOfMonth(date)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Select Times</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_TIMES.map((time) => {
              const isSelected = selectedTimes.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => toggleTime(time)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    isSelected ? 'bg-[var(--teal)] text-on-accent' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                      : '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              placeholder="Custom time"
              className="flex-1"
            />
            <Button variant="outline" onClick={addCustomTime} disabled={!customTime}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {selectedTimes.filter((t) => !(COMMON_TIMES as readonly string[]).includes(t)).length >
            0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTimes
                .filter((t) => !(COMMON_TIMES as readonly string[]).includes(t))
                .map((time) => (
                  <button
                    key={time}
                    onClick={() => toggleTime(time)}
                    className="px-4 py-2 rounded-xl font-medium bg-[var(--teal)] text-on-accent transition-all"
                    style={{
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    {time}
                    <X className="h-3 w-3 ml-2 inline" />
                  </button>
                ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-4 bg-[var(--bg-elevated)]"
          style={{
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Duration per slot</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">60 minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Total slots to create</span>
            <span className="text-sm font-semibold text-[var(--teal)]">
              {selectedDays.length * selectedTimes.length}
            </span>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
