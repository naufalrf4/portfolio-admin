'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BELL_POLL_INTERVAL_MS, INBOX_SUMMARY_LIMIT } from '../constants/notifications.constants';
import type { AppNotification, InboxPage } from '../types/notifications.types';

export interface NotificationSummary {
  readonly items: readonly AppNotification[];
  readonly unreadCount: number;
  readonly loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
}

export function useNotificationSummary(): NotificationSummary {
  const [items, setItems] = useState<readonly AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(
        `/api/v1/admin/notifications/inbox?limit=${INBOX_SUMMARY_LIMIT}`,
        signal ? { signal } : {}
      );
      const json = await res.json();

      if (json.success) {
        const page = json.data as InboxPage;
        setItems(page.notifications);
        setUnreadCount(page.unreadCount);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        void error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    void load(controller.signal);

    const interval = setInterval(() => {
      void load();
    }, BELL_POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [load]);

  const markAsRead = useCallback(
    async (id: string) => {
      const target = items.find((item) => item.id === id);

      if (!target || target.readAt) {
        return;
      }

      const readAt = new Date().toISOString();
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, readAt } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch(`/api/v1/admin/notifications/inbox/${id}`, { method: 'PATCH' });
      } finally {
        void load();
      }
    },
    [items, load]
  );

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await fetch('/api/v1/admin/notifications/inbox/read-all', { method: 'POST' });
    } finally {
      void load();
    }
  }, [load, unreadCount]);

  return {
    items,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: () => void load(),
  };
}
