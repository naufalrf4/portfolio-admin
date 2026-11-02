'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type {
  ContactForm,
  ContactSettings,
  ContactsPagination,
  FilterMode,
  BulkAction,
  UseContactsOptions,
  UseContactsResult,
  UseContactSettingsResult,
} from '../types/contacts.types';

const CONTACTS_ENDPOINT = '/api/v1/admin/contacts';
const SETTINGS_ENDPOINT = '/api/v1/admin/contact-settings';

export function useContacts(options: UseContactsOptions = {}): UseContactsResult {
  const { enabled = true, initialPage = 1, initialLimit = 20, initialFilter = 'all' } = options;

  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>(initialFilter);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<ContactsPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchContacts = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: initialLimit.toString(),
        ...(filterMode !== 'all' && { read: (filterMode === 'read').toString() }),
      });

      const response = await fetch(`${CONTACTS_ENDPOINT}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load contacts');
      }

      if (data.success && data.data?.contacts && Array.isArray(data.data.contacts)) {
        setContacts(data.data.contacts);
        setPagination(data.data.pagination);
        if (data.data.unreadCount !== undefined) {
          setUnreadCount(data.data.unreadCount);
        }
      } else {
        setContacts([]);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load contacts'));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, filterMode, page, initialLimit]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getContact = useCallback(async (id: string): Promise<ContactForm | null> => {
    try {
      const response = await fetch(`${CONTACTS_ENDPOINT}/${id}`);
      const data = await response.json();

      if (data.success) {
        return data.data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const updateContact = useCallback(
    async (id: string, updateData: Partial<ContactForm>): Promise<boolean> => {
      try {
        const response = await fetch(`${CONTACTS_ENDPOINT}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.success) {
          await fetchContacts();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to update contact';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to update contact'));
        return false;
      }
    },
    [fetchContacts]
  );

  const deleteContact = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`${CONTACTS_ENDPOINT}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Contact deleted successfully');
          await fetchContacts();
          return true;
        }
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete contact';
        toast.error(errorMsg);
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to delete contact'));
        return false;
      }
    },
    [fetchContacts]
  );

  const toggleReadStatus = useCallback(
    async (contact: ContactForm): Promise<boolean> => {
      const success = await updateContact(contact.id, { read: !contact.read });
      if (success) {
        toast.success(`Contact marked as ${!contact.read ? 'read' : 'unread'}`);
      }
      return success;
    },
    [updateContact]
  );

  const bulkAction = useCallback(
    async (ids: string[], action: BulkAction): Promise<boolean> => {
      try {
        const response = await fetch(`${CONTACTS_ENDPOINT}/bulk`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, action }),
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to perform bulk action');
          }
          throw new Error(`Failed to perform bulk action (${response.status})`);
        }

        const data = await response.json();

        if (data.success) {
          const actionLabels: Record<BulkAction, string> = {
            markRead: 'marked as read',
            markUnread: 'marked as unread',
            delete: 'deleted',
          };
          toast.success(`${ids.length} contact(s) ${actionLabels[action]}`);
          await fetchContacts();
          return true;
        }
        toast.error(data.error?.message || 'Failed to perform bulk action');
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to perform bulk action'));
        return false;
      }
    },
    [fetchContacts]
  );

  const handleSetFilterMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    setPage(1);
  }, []);

  return {
    contacts,
    loading,
    pagination,
    unreadCount,
    filterMode,
    setFilterMode: handleSetFilterMode,
    setPage,
    refetch: fetchContacts,
    getContact,
    updateContact,
    deleteContact,
    toggleReadStatus,
    bulkAction,
  };
}

export function useContactSettings(): UseContactSettingsResult {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(SETTINGS_ENDPOINT);
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load settings');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(getErrorMessage(err, 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updateData: Partial<ContactSettings>): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await fetch(SETTINGS_ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.success) {
          setSettings(data.data);
          toast.success('Settings saved successfully');
          return true;
        }
        toast.error(data.error?.message || 'Failed to save settings');
        return false;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to save settings'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    settings,
    loading,
    saving,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}
