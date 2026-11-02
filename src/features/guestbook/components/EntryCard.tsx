import { useState } from 'react';
import Image from 'next/image';
import { formatDateTime } from '@/lib/utils/date';
import { getInitials } from '@/lib/utils/string';
import { SURFACE_STYLES } from '../constants/guestbook.constants';
import { EyeIcon, EyeOffIcon, TrashIcon } from './Icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { GuestbookEntry } from '../types/guestbook.types';

interface EntryCardProps {
  entry: GuestbookEntry;
  index: number;
  onToggleVisibility: (id: string, currentValue: boolean) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, index, onToggleVisibility, onDelete }: EntryCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  function handleDeleteConfirm() {
    onDelete(entry.id);
    setDeleteModalOpen(false);
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="rounded-[var(--radius-container)] p-6 transition-all duration-300 hover:-translate-y-1"
        style={{
          background: SURFACE_STYLES.background,
          boxShadow: SURFACE_STYLES.shadows.extruded,
          opacity: 0,
          animation: `fadeInUp 0.5s ease-out ${index * 100}ms forwards`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              background: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.inset,
            }}
          >
            {entry.user.image ? (
              <Image
                src={entry.user.image}
                alt={entry.user.name || 'User'}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-line-strong bg-accent text-accent-foreground font-semibold text-sm">
                {getInitials(entry.user.name, entry.user.email)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate" style={{ color: SURFACE_STYLES.foreground }}>
                {entry.user.name || 'Anonymous'}
              </h3>
              {entry.reactions.length > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: SURFACE_STYLES.background,
                    boxShadow: SURFACE_STYLES.shadows.inset,
                    color: SURFACE_STYLES.accent,
                  }}
                >
                  {entry.reactions.length} reactions
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: SURFACE_STYLES.muted }}>
              {entry.message}
            </p>
            <p className="text-sm" style={{ color: SURFACE_STYLES.muted }}>
              {formatDateTime(entry.createdAt)}
            </p>
          </div>
        </div>

        <div
          className="mt-4 pt-4 flex items-center justify-between"
          style={{
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleVisibility(entry.id, entry.visible)}
              className="relative w-14 h-8 rounded-full transition-all duration-300"
              style={{
                background: SURFACE_STYLES.background,
                boxShadow: SURFACE_STYLES.shadows.inset,
              }}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center border border-line-strong ${
                  entry.visible
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-card text-muted-foreground'
                }`}
                style={{
                  left: entry.visible ? '30px' : '4px',
                }}
              >
                {entry.visible ? <EyeIcon /> : <EyeOffIcon />}
              </span>
            </button>
            <span className="text-sm" style={{ color: SURFACE_STYLES.muted }}>
              {entry.visible ? 'Visible' : 'Hidden'}
            </span>
          </div>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-3 rounded-2xl transition-all duration-200 hover:scale-95 group"
            style={{
              background: SURFACE_STYLES.background,
              boxShadow: SURFACE_STYLES.shadows.small,
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        entryName={entry.user.name || 'Anonymous'}
      />
    </>
  );
}
