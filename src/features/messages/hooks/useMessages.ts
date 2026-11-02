import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AnonymousMessage, FilterTab } from '../types/messages.types';
import { logger } from '@/lib/utils/logger';

export function useMessages() {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMessages() {
      try {
        const url =
          activeTab === 'all'
            ? '/api/v1/admin/messages'
            : `/api/v1/admin/messages?read=${activeTab === 'read'}`;

        const response = await fetch(url, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.messages);
          setUnreadCount(data.data.unreadCount);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('Failed to fetch messages', error);
          toast.error('Failed to load messages');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    return () => {
      controller.abort();
    };
  }, [activeTab]);

  const toggleReadStatus = useCallback(async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/v1/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentValue }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !currentValue } : m)));
        setUnreadCount((prev) => (currentValue ? prev + 1 : prev - 1));
        toast.success(currentValue ? 'Message marked as unread' : 'Message marked as read');
      }
    } catch (error) {
      logger.error('Failed to toggle read status', error);
      toast.error('Failed to update read status');
    }
  }, []);

  async function markAllAsRead() {
    setMarkingAllRead(true);
    const toastId = toast.loading('Marking all as read...');
    try {
      const unreadMessages = messages.filter((m) => !m.read);
      await Promise.all(
        unreadMessages.map((m) =>
          fetch(`/api/v1/admin/messages/${m.id}/read`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      setUnreadCount(0);
      toast.success('All messages marked as read', { id: toastId });
    } catch (error) {
      logger.error('Failed to mark all as read', error);
      toast.error('Failed to mark messages as read', { id: toastId });
    } finally {
      setMarkingAllRead(false);
    }
  }

  async function deleteMessage(id: string) {
    try {
      const response = await fetch(`/api/v1/admin/messages/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        const deletedMessage = messages.find((m) => m.id === id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (deletedMessage && !deletedMessage.read) {
          setUnreadCount((prev) => prev - 1);
        }
        toast.success('Message deleted successfully');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      logger.error('Failed to delete message', error);
      toast.error('Failed to delete message');
      return { success: false };
    }
  }

  return {
    messages,
    loading,
    unreadCount,
    activeTab,
    setActiveTab,
    toggleReadStatus,
    markAllAsRead,
    markingAllRead,
    deleteMessage,
  };
}
