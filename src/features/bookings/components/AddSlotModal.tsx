'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { toast } from 'sonner';
import type { BookingSlot } from '../types/bookings.types';
import { formatDateISO } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/errors';

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slot: BookingSlot | null;
  prefilledDate: string | null;
}

interface ValidationErrors {
  date?: string;
  startTime?: string;
  duration?: string;
}

export function AddSlotModal({
  isOpen,
  onClose,
  onSuccess,
  slot,
  prefilledDate,
}: AddSlotModalProps) {
  const [form, setForm] = useState({
    date: '',
    startTime: '',
    duration: 60,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (slot) {
      setForm({
        date: slot.date.split('T')[0],
        startTime: slot.startTime,
        duration: 60,
      });
    } else if (prefilledDate) {
      setForm({
        date: prefilledDate,
        startTime: '09:00',
        duration: 60,
      });
    } else {
      setForm({
        date: formatDateISO(new Date()),
        startTime: '09:00',
        duration: 60,
      });
    }
    setErrors({});
  }, [slot, prefilledDate, isOpen]);

  function validateForm(): boolean {
    const newErrors: ValidationErrors = {};

    if (!form.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      newErrors.date = 'Invalid date format';
    }

    if (!form.startTime) {
      newErrors.startTime = 'Time is required';
    } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.startTime)) {
      newErrors.startTime = 'Time must be HH:MM format';
    }

    if (!form.duration || form.duration < 15 || form.duration > 120) {
      newErrors.duration = 'Duration must be between 15-120 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSaving(true);
    try {
      const url = slot?.id
        ? `/api/v1/admin/booking-slots/${slot.id}`
        : '/api/v1/admin/booking-slots';

      const response = await fetch(url, {
        method: slot?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          time: form.startTime,
          duration: form.duration,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(slot?.id ? 'Slot updated successfully' : 'Slot created successfully');
        onClose();
        onSuccess();
      } else {
        toast.error(getErrorMessage(data.error, 'Failed to save slot'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save slot'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title={slot?.id ? 'Edit Time Slot' : 'Add Time Slot'}
      description="Create a new booking slot for appointments"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="slotDate">Date</Label>
          <Input
            id="slotDate"
            type="date"
            value={form.date}
            onChange={(e) => {
              setForm({ ...form, date: e.target.value });
              if (errors.date) {
                setErrors({ ...errors, date: undefined });
              }
            }}
            className={errors.date ? 'border-red-500' : ''}
          />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slotTime">Start Time</Label>
          <Input
            id="slotTime"
            type="time"
            value={form.startTime}
            onChange={(e) => {
              setForm({ ...form, startTime: e.target.value });
              if (errors.startTime) {
                setErrors({ ...errors, startTime: undefined });
              }
            }}
            className={errors.startTime ? 'border-red-500' : ''}
          />
          {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slotDuration">Duration (minutes)</Label>
          <select
            id="slotDuration"
            value={form.duration}
            onChange={(e) => {
              setForm({ ...form, duration: Number(e.target.value) });
              if (errors.duration) {
                setErrors({ ...errors, duration: undefined });
              }
            }}
            className={`w-full px-3 py-2 rounded-xl border-none outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--teal)]/30 bg-[var(--bg-elevated)] ${
              errors.duration ? 'ring-2 ring-red-500' : ''
            }`}
            style={{
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
          {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
        </div>
      </div>
    </ResponsiveModal>
  );
}
