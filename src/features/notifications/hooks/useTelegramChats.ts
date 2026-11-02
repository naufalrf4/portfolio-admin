'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { DiscoveredChat } from '../types/notifications.types';

export function useTelegramChats() {
  const [chats, setChats] = useState<DiscoveredChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const discoverChats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/notifications/telegram/chats');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setChats(data.data);
        setLoaded(true);
        if (data.data.length === 0) {
          toast.info('No chats found yet. Send a message in the group, then scan again.');
        }
        return;
      }
      toast.error(data.error?.message || 'Failed to load Telegram chats');
    } catch {
      toast.error('Network error loading Telegram chats');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setChats([]);
    setLoaded(false);
  }, []);

  return { chats, loading, loaded, discoverChats, reset };
}
