'use client';

import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  useGuestbook,
  EntryCard,
  LoadingState,
  EmptyState,
  SURFACE_STYLES,
  FILTER_BUTTONS,
} from '@/features/guestbook';

export function GuestbookPageContent() {
  return <GuestbookPanel showHeader />;
}

interface GuestbookPanelProps {
  showHeader?: boolean;
}

export function GuestbookPanel({ showHeader = false }: GuestbookPanelProps) {
  const { entries, filteredEntries, loading, filter, setFilter, toggleVisibility, deleteEntry } =
    useGuestbook();

  const visibleCount = entries.filter((e) => e.visible).length;
  const hiddenCount = entries.filter((e) => !e.visible).length;

  return (
    <PageWrapper className={showHeader ? undefined : 'px-0 pb-0'}>
      {showHeader ? (
        <PageHeader
          title="Guestbook"
          description="Manage guestbook entries from visitors"
          icon={<MessageSquare />}
          stats={[
            { label: 'Total', value: entries.length, variant: 'default' },
            { label: 'Visible', value: visibleCount, variant: 'success' },
            { label: 'Hidden', value: hiddenCount, variant: 'default' },
          ]}
        />
      ) : null}

      <div
        className="rounded-[var(--radius-base)] p-2 mb-8 inline-flex gap-2"
        style={{
          background: SURFACE_STYLES.background,
          boxShadow: SURFACE_STYLES.shadows.inset,
        }}
      >
        {FILTER_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className="px-6 py-3 rounded-[18px] font-medium transition-all duration-300"
            style={{
              background: filter === btn.key ? SURFACE_STYLES.background : 'transparent',
              color: filter === btn.key ? SURFACE_STYLES.accent : SURFACE_STYLES.muted,
              boxShadow: filter === btn.key ? SURFACE_STYLES.shadows.small : 'none',
            }}
          >
            {btn.label}{' '}
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background:
                  filter === btn.key
                    ? 'var(--teal)'
                    : 'rgba(107, 114, 128, 0.2)',
                color: filter === btn.key ? 'white' : SURFACE_STYLES.muted,
              }}
            >
              {btn.key === 'all' && entries.length}
              {btn.key === 'visible' && visibleCount}
              {btn.key === 'hidden' && hiddenCount}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : filteredEntries.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={index}
              onToggleVisibility={toggleVisibility}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
