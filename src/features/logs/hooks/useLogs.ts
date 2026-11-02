'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { AppLogRow, LogCounts, LogFilters } from '../types/logs.types';

interface UseLogsReturn {
  logs: AppLogRow[];
  counts: LogCounts;
  loading: boolean;
  filters: LogFilters;
  setFilters: (update: LogFilters | ((prev: LogFilters) => LogFilters)) => void;
  clearFilters: () => void;
  nextCursor: string | null;
  hasPrevious: boolean;
  loadNext: () => void;
  loadPrevious: () => void;
  refresh: () => void;
}

const DEFAULT_COUNTS: LogCounts = {
  debug: 0,
  info: 0,
  warn: 0,
  error: 0,
};

export function useLogs(initialFilters: LogFilters = {}): UseLogsReturn {
  const [filters, setFiltersState] = useState<LogFilters>(initialFilters);
  const [debouncedMessage, setDebouncedMessage] = useState<string | undefined>(
    initialFilters.message
  );
  const [logs, setLogs] = useState<AppLogRow[]>([]);
  const [counts, setCounts] = useState<LogCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [activeCursor, setActiveCursor] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMessage(filters.message);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.message]);

  const fetchLogs = useCallback(async (cursor: string | null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('limit', '20');

      if (filters.level) params.set('level', filters.level);
      if (filters.service) params.set('service', filters.service);
      if (debouncedMessage && debouncedMessage.trim()) {
        params.set('message', debouncedMessage.trim());
      }
      if (filters.correlationId && filters.correlationId.trim()) {
        params.set('correlationId', filters.correlationId.trim());
      }
      if (cursor) {
        params.set('cursor', cursor);
      }

      const res = await fetch(`/api/v1/admin/logs?${params.toString()}`, {
        signal: controller.signal,
      });
      const json = await res.json();

      if (json.success && json.data) {
        setLogs(json.data.logs ?? []);
        setNextCursor(json.data.nextCursor ?? null);
        if (json.data.counts) {
          setCounts(json.data.counts);
        }
      } else {
        toast.error('Failed to load logs');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to load logs');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [filters.level, filters.service, filters.correlationId, debouncedMessage]);

  useEffect(() => {
    setCursorHistory([]);
    setActiveCursor(null);
    fetchLogs(null);
  }, [filters.level, filters.service, filters.correlationId, debouncedMessage, fetchLogs]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadNext = useCallback(() => {
    if (!nextCursor) return;
    setCursorHistory((prev) => (activeCursor ? [...prev, activeCursor] : [...prev, '']));
    setActiveCursor(nextCursor);
    fetchLogs(nextCursor);
  }, [nextCursor, activeCursor, fetchLogs]);

  const loadPrevious = useCallback(() => {
    if (cursorHistory.length === 0) return;
    const prevHistory = [...cursorHistory];
    const prevCursor = prevHistory.pop();
    setCursorHistory(prevHistory);
    const targetCursor = prevCursor === '' || !prevCursor ? null : prevCursor;
    setActiveCursor(targetCursor);
    fetchLogs(targetCursor);
  }, [cursorHistory, fetchLogs]);

  const refresh = useCallback(() => {
    fetchLogs(activeCursor);
  }, [activeCursor, fetchLogs]);

  const setFilters = useCallback(
    (update: LogFilters | ((prev: LogFilters) => LogFilters)) => {
      setFiltersState((prev) => (typeof update === 'function' ? update(prev) : update));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  return {
    logs,
    counts,
    loading,
    filters,
    setFilters,
    clearFilters,
    nextCursor,
    hasPrevious: cursorHistory.length > 0,
    loadNext,
    loadPrevious,
    refresh,
  };
}
