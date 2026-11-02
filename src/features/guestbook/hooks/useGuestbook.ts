import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { GuestbookEntry, FilterType } from '../types/guestbook.types';

export function useGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEntries() {
      try {
        const response = await fetch('/api/v1/admin/guestbook', {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) {
          setEntries(data.data.entries);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to load guestbook entries');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'visible') return entry.visible;
    if (filter === 'hidden') return !entry.visible;
    return true;
  });

  const toggleVisibility = useCallback(async (id: string, currentValue: boolean) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, visible: !currentValue } : e)));

    try {
      const response = await fetch(`/api/v1/admin/guestbook/${id}/visibility`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!data.success) {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, visible: currentValue } : e)));
        toast.error('Failed to update visibility');
      } else {
        toast.success(`Entry ${!currentValue ? 'shown' : 'hidden'}`);
      }
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, visible: currentValue } : e)));
      toast.error('Failed to update visibility');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/v1/admin/guestbook/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success('Entry deleted successfully');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch {
      toast.error('Failed to delete entry');
    }
  }, []);

  return {
    entries,
    filteredEntries,
    loading,
    filter,
    setFilter,
    toggleVisibility,
    deleteEntry,
  };
}
