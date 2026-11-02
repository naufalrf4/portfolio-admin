import { Mail, MailOpen, Check, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';
import { truncate } from '@/lib/utils/string';
import { SURFACE_SHADOWS, COLORS } from '../constants/messages.constants';
import type { AnonymousMessage } from '../types/messages.types';

interface MessageCardProps {
  message: AnonymousMessage;
  onSelect: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}

export function MessageCard({ message, onSelect, onToggleRead, onDelete }: MessageCardProps) {
  return (
    <div
      onClick={onSelect}
      className="rounded-[var(--radius-container)] p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] relative overflow-hidden group h-full flex flex-col"
      style={{
        backgroundColor: COLORS.background,
        boxShadow: SURFACE_SHADOWS.extruded,
        borderLeft: !message.read ? `4px solid ${COLORS.amber}` : '4px solid transparent',
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.inset,
            }}
          >
            {message.read ? (
              <MailOpen className="w-5 h-5" style={{ color: COLORS.accent }} />
            ) : (
              <Mail className="w-5 h-5" style={{ color: COLORS.amber }} />
            )}
          </div>
          {!message.read && (
            <div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full pulse-amber"
              style={{ backgroundColor: COLORS.amber }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-base leading-relaxed mb-3 line-clamp-3 break-words"
            style={{ color: COLORS.foreground }}
          >
            {truncate(message.content, 90)}
          </p>

          <p className="text-sm" style={{ color: COLORS.muted }}>
            {formatDateTime(message.createdAt)}
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-4 mt-auto border-t border-[var(--border)]"
      >
        <span
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{
            backgroundColor: message.read ? COLORS.accentSoft : COLORS.amberSoft,
            color: message.read ? COLORS.accent : COLORS.amber,
          }}
        >
          {message.read ? 'Read' : 'Unread'}
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleRead}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.extrudedSm,
              color: COLORS.foreground,
            }}
            title={message.read ? 'Mark as unread' : 'Mark as read'}
          >
            {message.read ? <Mail className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: COLORS.background,
              boxShadow: SURFACE_SHADOWS.extrudedSm,
              color: 'var(--error)',
            }}
            title="Delete message"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
