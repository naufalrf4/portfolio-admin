'use client';

import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BookingSlot } from '../types/bookings.types';
import { DAY_NAMES, SURFACE_STYLES } from '../constants';
import { formatDateShort, getWeekdayIndex } from '../utils/dateUtils';
import { SlotCard } from './SlotCard';

interface DayCardProps {
  date: Date;
  slots: BookingSlot[];
  isToday: boolean;
  onAddSlot: () => void;
  onEditSlot: (slot: BookingSlot) => void;
  onDeleteSlot: (slot: BookingSlot) => void;
  onToggleStatus: (slot: BookingSlot) => void;
}

export function DayCard({
  date,
  slots,
  isToday,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onToggleStatus,
}: DayCardProps) {
  const dayIndex = getWeekdayIndex(date);

  return (
    <div
      className={`rounded-2xl p-4 bg-[var(--bg-elevated)] transition-all ${isToday ? 'ring-2 ring-[var(--teal)]/50' : ''}`}
      style={SURFACE_STYLES.cardInset}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            {DAY_NAMES[dayIndex]}
            {isToday && (
              <Badge variant="primary" className="ml-2 text-xs">
                Today
              </Badge>
            )}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">{formatDateShort(date)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onAddSlot}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] text-center py-4">No slots</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onEdit={() => onEditSlot(slot)}
              onDelete={() => onDeleteSlot(slot)}
              onToggle={() => onToggleStatus(slot)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
