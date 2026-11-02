import { CheckCheck } from 'lucide-react';
import { SURFACE_SHADOWS, COLORS } from '../constants/messages.constants';

interface MarkAllAsReadButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function MarkAllAsReadButton({ onClick, disabled }: MarkAllAsReadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 py-3 px-6 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      style={{
        backgroundColor: COLORS.background,
        boxShadow: SURFACE_SHADOWS.extrudedSm,
        color: COLORS.accent,
      }}
    >
      <CheckCheck className="w-5 h-5" />
      {disabled ? 'Marking...' : 'Mark All as Read'}
    </button>
  );
}
