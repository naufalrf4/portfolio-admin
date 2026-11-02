'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { OutboxRow } from '../types/notifications.types';

export function useNotificationOutbox() {
  const [rows, setRows] = useState<OutboxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(50);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchOutbox = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') {
          params.set('status', statusFilter);
        }
        if (channelFilter && channelFilter !== 'all') {
          params.set('channel', channelFilter);
        }
        params.set('limit', String(limit));

        const res = await fetch(`/api/v1/admin/notifications/outbox?${params.toString()}`, {
          ...(signal ? { signal } : {}),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setRows(data.data);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to load notification outbox');
        }
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, channelFilter, limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchOutbox(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchOutbox]);

  const retryRow = useCallback(
    async (id: string) => {
      setRetryingId(id);
      try {
        const res = await fetch(`/api/v1/admin/notifications/outbox/${id}/retry`, {
          method: 'POST',
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Notification re-queued for delivery (status set to pending)');
          void fetchOutbox();
        } else {
          toast.error(data.error?.message || 'Failed to retry notification');
        }
      } catch {
        toast.error('Network error retrying notification');
      } finally {
        setRetryingId(null);
      }
    },
    [fetchOutbox]
  );

  return {
    rows,
    loading,
statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    limit,
    setLimit,
    retryingId,
    retryRow,
    refresh: fetchOutbox,
  };
}
