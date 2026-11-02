'use client';

import type { ReactNode } from 'react';

interface ActionButtonProps {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  hoverColor?: string;
}

export function ActionButton({
  icon,
  tooltip,
  onClick,
  hoverColor = 'var(--teal)',
}: ActionButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
        style={{
          boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        {icon}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--text-primary)] text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </div>
    </div>
  );
}
