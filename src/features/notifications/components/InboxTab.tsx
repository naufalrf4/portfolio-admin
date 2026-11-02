'use client';

import { BellOff, Check, CheckCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { getEventTypeLabel, LEVEL_BADGE_VARIANTS } from '../constants/notifications.constants';
import type { AppNotification } from '../types/notifications.types';

interface InboxTabProps {
  readonly notifications: readonly AppNotification[];
  readonly unreadCount: number;
  readonly loading: boolean;
  readonly loadingMore: boolean;
  readonly unreadOnly: boolean;
  readonly hasMore: boolean;
  readonly setUnreadOnly: (value: boolean) => void;
  readonly loadMore: () => void;
  readonly markRead: (id: string) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
  readonly remove: (id: string) => Promise<void>;
  readonly clearRead: () => Promise<void>;
}

export function InboxTab({
  notifications,
  unreadCount,
  loading,
  loadingMore,
  unreadOnly,
  hasMore,
  setUnreadOnly,
  loadMore,
  markRead,
  markAllRead,
  remove,
  clearRead,
}: InboxTabProps) {
  const hasReadNotifications = notifications.some((notification) => notification.readAt !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Inbox</h2>
          <p className="text-xs text-[var(--text-secondary)]">In-app notifications are always delivered here.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="surface-sunken shape-base flex h-9 items-center gap-2 px-3 text-xs text-[var(--text-secondary)]">
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} aria-label="Show unread notifications only" />
            Unread only
          </label>
          <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={unreadCount === 0} className="h-9 px-3 text-xs">
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark all read
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!hasReadNotifications} className="h-9 px-3 text-xs text-[var(--error)] hover:bg-[var(--error)]/10">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear read
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear read notifications?</AlertDialogTitle>
                <AlertDialogDescription>This permanently removes every read notification from the inbox.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void clearRead()} className="bg-[var(--error)] text-on-error hover:brightness-110">
                  Clear read notifications
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="shape-container overflow-hidden bg-[var(--bg-card)] surface-raised">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="shape-base space-y-2 bg-[var(--bg-elevated)] p-4">
                <Skeleton className="skeleton-shimmer h-4 w-40" />
                <Skeleton className="skeleton-shimmer h-3 w-full" />
                <Skeleton className="skeleton-shimmer h-3 w-24" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
            <BellOff className="h-7 w-7 text-[var(--text-tertiary)]" />
            <p className="text-sm font-medium text-[var(--text-primary)]">No notifications found</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {unreadOnly ? 'You have no unread notifications.' : 'New notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notification) => {
              const isUnread = notification.readAt === null;

              return (
                <article
                  key={notification.id}
                  className={cn(
                    'group flex gap-3 p-4 motion-fast',
                    isUnread && 'border-l-2 border-l-[var(--teal)] bg-[var(--teal)]/5'
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={LEVEL_BADGE_VARIANTS[notification.level]} className="badge-pill text-[10px]">
                        {notification.level}
                      </Badge>
                      <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
                        {getEventTypeLabel(notification.eventType)}
                      </span>
                    </div>
                    <h3 className={cn('text-sm text-[var(--text-primary)]', isUnread ? 'font-semibold' : 'font-medium')}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{notification.body}</p>
                    <time className="text-[11px] text-[var(--text-tertiary)]" dateTime={notification.createdAt}>
                      {formatRelativeTime(notification.createdAt)}
                    </time>
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    {isUnread ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Mark ${notification.title} as read`}
                        onClick={() => void markRead(notification.id)}
                        className="icon-btn h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--teal)]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${notification.title}`}
                      onClick={() => void remove(notification.id)}
                      className="icon-btn h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--error)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore} className="h-9 px-4 text-xs">
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
