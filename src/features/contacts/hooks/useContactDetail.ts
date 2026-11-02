import { useCallback, useEffect, useState } from 'react';
import type { ContactForm } from '../types/contacts.types';

interface UseContactDetailOptions {
  contactId: string;
  autoMarkRead?: boolean;
}

interface UseContactDetailResult {
  contact: ContactForm | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  markAsRead: () => Promise<boolean>;
}

export function useContactDetail({
  contactId,
  autoMarkRead = false,
}: UseContactDetailOptions): UseContactDetailResult {
  const [contact, setContact] = useState<ContactForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const markAsReadInternal = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      const data = await response.json();

      if (data.success) {
        setContact((currentContact) =>
          currentContact ? { ...currentContact, read: true } : currentContact
        );
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [contactId]);

  const fetchContact = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/contacts/${contactId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }

      const data = await response.json();

      if (data.success) {
        setContact(data.data);

        if (autoMarkRead && !data.data.read) {
          await markAsReadInternal();
        }
      } else {
        throw new Error(data.error || 'Failed to fetch contact');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [autoMarkRead, contactId, markAsReadInternal]);

  async function markAsRead(): Promise<boolean> {
    return markAsReadInternal();
  }

  useEffect(() => {
    void fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    error,
    refetch: fetchContact,
    markAsRead,
  };
}
