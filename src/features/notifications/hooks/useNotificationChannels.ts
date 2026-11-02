'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Channel, ChannelFormData } from '../types/notifications.types';

export function useNotificationChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchChannels = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/v1/admin/notifications/channels', {
        ...(signal ? { signal } : {}),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setChannels(data.data);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to load notification channels');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchChannels(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchChannels]);

  const createChannel = useCallback(async (formData: ChannelFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/admin/notifications/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setChannels((prev) => [...prev, data.data]);
        toast.success(`Channel "${data.data.name}" created`);
        return true;
      }
      toast.error(data.error?.message || 'Failed to create channel');
      return false;
    } catch {
      toast.error('Network error creating channel');
      return false;
    }
  }, []);

  const updateChannel = useCallback(
    async (id: string, formData: Partial<ChannelFormData>): Promise<boolean> => {
      try {
        const res = await fetch(`/api/v1/admin/notifications/channels/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setChannels((prev) => prev.map((c) => (c.id === id ? data.data : c)));
          toast.success(`Channel "${data.data.name}" updated`);
          return true;
        }
        toast.error(data.error?.message || 'Failed to update channel');
        return false;
      } catch {
        toast.error('Network error updating channel');
        return false;
      }
    },
    []
  );

  const toggleChannel = useCallback(
    async (id: string, currentEnabled: boolean) => {
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: !currentEnabled } : c))
      );
      try {
        const res = await fetch(`/api/v1/admin/notifications/channels/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !currentEnabled }),
        });
        const data = await res.json();
        if (!data.success) {
          setChannels((prev) =>
            prev.map((c) => (c.id === id ? { ...c, enabled: currentEnabled } : c))
          );
          toast.error(data.error?.message || 'Failed to toggle channel');
        } else {
          toast.success(`Channel ${!currentEnabled ? 'enabled' : 'disabled'}`);
        }
      } catch {
        setChannels((prev) =>
          prev.map((c) => (c.id === id ? { ...c, enabled: currentEnabled } : c))
        );
        toast.error('Network error toggling channel');
      }
    },
    []
  );

  const deleteChannel = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/notifications/channels/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setChannels((prev) => prev.filter((c) => c.id !== id));
        toast.success('Channel deleted');
        return true;
      }
      toast.error(data.error?.message || 'Failed to delete channel');
      return false;
    } catch {
      toast.error('Network error deleting channel');
      return false;
    }
  }, []);

  const sendTestMessage = useCallback(async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/v1/admin/notifications/channels/${id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.data?.ok) {
        toast.success(`Test message sent (Telegram ID: ${data.data.messageId})`);
      } else {
        const description =
          data.error?.message ||
          (data.data?.description ? `Telegram error: ${data.data.description}` : 'Test message delivery failed');
        toast.error(description);
      }
    } catch {
      toast.error('Network error sending test message');
    } finally {
      setTestingId(null);
    }
  }, []);

  return {
    channels,
    loading,
    testingId,
    createChannel,
    updateChannel,
    toggleChannel,
    deleteChannel,
    sendTestMessage,
    refresh: fetchChannels,
  };
}
