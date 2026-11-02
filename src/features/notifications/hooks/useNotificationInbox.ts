'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { INBOX_PAGE_SIZE } from '../constants/notifications.constants';
import type { AppNotification, InboxPage } from '../types/notifications.types';

interface UseNotificationInboxReturn {
  readonly notifications: readonly AppNotification[];
  readonly unreadCount: number;
  readonly loading: boolean;
  readonly loadingMore: boolean;
  readonly unreadOnly: boolean;
  readonly hasMore: boolean;
  setUnreadOnly: (value: boolean) => void;
  loadMore: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
  refresh: () => void;
}

export function useNotificationInbox(): UseNotificationInboxReturn {
  const [notifications, setNotifications] = useState<readonly AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({ limit: String(INBOX_PAGE_SIZE) });
        if (unreadOnly) params.set('unreadOnly', 'true');
        if (cursor) params.set('cursor', cursor);

        const res = await fetch(`/api/v1/admin/notifications/inbox?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();

        if (!json.success) {
          toast.error(json.error?.message ?? 'Failed to load notifications');
          return;
        }

        const page = json.data as InboxPage;
        setNotifications((prev) =>
          cursor ? [...prev, ...page.notifications] : page.notifications
        );
        setNextCursor(page.nextCursor);
        setUnreadCount(page.unreadCount);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to load notifications');
        }
      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [unreadOnly]
  );

  useEffect(() => {
    void fetchPage(null);
  }, [fetchPage]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = useCallback(() => {
    if (nextCursor) {
      void fetchPage(nextCursor);
    }
  }, [fetchPage, nextCursor]);

  const markRead = useCallback(
    async (id: string) => {
      const target = notifications.find((item) => item.id === id);

      if (!target || target.readAt) {
        return;
      }

      const readAt = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch(`/api/v1/admin/notifications/inbox/${id}`, { method: 'PATCH' });
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error?.message ?? 'Failed to mark as read');
        }
      } catch {
        toast.error('Failed to mark notification as read');
        void fetchPage(null);
      }
    },
    [fetchPage, notifications]
  );

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/notifications/inbox/read-all', { method: 'POST' });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message ?? 'Failed to mark all as read');
      }

      toast.success(json.message ?? 'All notifications marked as read');
      void fetchPage(null);
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  }, [fetchPage, unreadCount]);

  const remove = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/v1/admin/notifications/inbox/${id}`, { method: 'DELETE' });
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error?.message ?? 'Failed to delete');
        }

        setNotifications((prev) => prev.filter((item) => item.id !== id));
        void fetchPage(null);
      } catch {
        toast.error('Failed to delete notification');
      }
    },
    [fetchPage]
  );

  const clearRead = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/notifications/inbox', { method: 'DELETE' });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message ?? 'Failed to clear notifications');
      }

      toast.success(json.message ?? 'Cleared read notifications');
      void fetchPage(null);
    } catch {
      toast.error('Failed to clear read notifications');
    }
  }, [fetchPage]);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    unreadOnly,
    hasMore: nextCursor !== null,
    setUnreadOnly,
    loadMore,
    markRead,
    markAllRead,
    remove,
    clearRead,
    refresh: () => void fetchPage(null),
  };
}
