'use client';

import { Trash2, Ban, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BookingSlot } from '../types/bookings.types';
import { SLOT_STATUS_STYLES, SURFACE_STYLES } from '../constants';

interface SlotCardProps {
  slot: BookingSlot;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

export function SlotCard({ slot, onEdit, onDelete, onToggle }: SlotCardProps) {
  const style = SLOT_STATUS_STYLES[slot.status];
  const isBlocked = slot.status === 'BLOCKED';
  const isBooked = slot.status === 'BOOKED';

  function getBadgeVariant() {
    if (slot.status === 'AVAILABLE') return 'success';
    if (slot.status === 'BOOKED') return 'primary';
    return 'default';
  }

  return (
    <div className={`rounded-xl p-3 border ${style.bg} ${style.border} transition-all`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${style.text} ${isBlocked ? 'line-through' : ''}`}>
          {slot.startTime} - {slot.endTime}
        </span>
        <Badge variant={getBadgeVariant()} className="text-xs">
          {slot.status}
        </Badge>
      </div>

      {isBooked && slot.bookerName && (
        <p className="text-xs text-[var(--text-secondary)] mb-2 truncate">{slot.bookerName}</p>
      )}

      <div className="flex items-center gap-1">
        {!isBooked && (
          <>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
              style={SURFACE_STYLES.buttonMicro}
              title={slot.status === 'AVAILABLE' ? 'Block' : 'Unblock'}
            >
              <Ban className="h-3 w-3" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
              style={SURFACE_STYLES.buttonMicro}
              title="Edit"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
          style={SURFACE_STYLES.buttonMicro}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
