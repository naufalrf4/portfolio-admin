import { MessageSquare } from 'lucide-react';
import { SURFACE_SHADOWS, COLORS } from '../constants/messages.constants';
import type { FilterTab } from '../types/messages.types';

interface EmptyStateProps {
  activeTab: FilterTab;
}

const EMPTY_STATE_CONFIG: Record<FilterTab, { title: string; description: string }> = {
  all: {
    title: 'No messages yet',
    description: 'When visitors send you anonymous messages, they will appear here.',
  },
  unread: {
    title: 'All caught up!',
    description: "You've read all your messages. Great job!",
  },
  read: {
    title: 'No read messages',
    description: "You haven't read any messages yet.",
  },
};

export function EmptyState({ activeTab }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[activeTab];

  return (
    <div
      className="rounded-[var(--radius-container)] p-12 text-center"
      style={{
        backgroundColor: COLORS.background,
        boxShadow: SURFACE_SHADOWS.extruded,
      }}
    >
      <div
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: COLORS.background,
          boxShadow: SURFACE_SHADOWS.inset,
        }}
      >
        <MessageSquare className="w-10 h-10" style={{ color: COLORS.muted }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.foreground }}>
        {config.title}
      </h3>
      <p style={{ color: COLORS.muted }}>{config.description}</p>
    </div>
  );
}
