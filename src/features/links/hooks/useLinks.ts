'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { ProfileLink, FilterMode, FormData } from '../types/links.types';

export function useLinks() {
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLinks = useCallback(async () => {
    const controller = new AbortController();
    try {
      const response = await fetch('/api/v1/admin/links', {
        signal: controller.signal,
      });
      const data = await response.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to load links');
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = links
    .filter((link) => {
      if (filterMode === 'visible') return link.visible;
      if (filterMode === 'hidden') return !link.visible;
      return true;
    })
    .filter((link) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        link.label.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        (link.icon && link.icon.toLowerCase().includes(query))
      );
    });

  async function toggleVisibility(link: ProfileLink) {
    try {
      const response = await fetch(`/api/v1/admin/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !link.visible }),
      });
      const data = await response.json();
      if (data.success) {
        setLinks((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, visible: !link.visible } : l))
        );
        toast.success('Link visibility updated');
      }
    } catch {
      toast.error('Failed to update visibility');
    }
  }

  async function createLink(formData: FormData) {
    try {
      const payload = {
        label: formData.label,
        url: formData.url,
        icon: formData.icon || undefined,
      };

      const response = await fetch('/api/v1/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        fetchLinks();
        toast.success('Link created successfully');
        return { success: true };
      }
      return { success: false };
    } catch {
      toast.error('Failed to create link');
      return { success: false };
    }
  }

  async function updateLink(id: string, formData: FormData) {
    try {
      const payload = {
        label: formData.label,
        url: formData.url,
        icon: formData.icon || undefined,
      };

      const response = await fetch(`/api/v1/admin/links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        fetchLinks();
        toast.success('Link updated successfully');
        return { success: true };
      }
      return { success: false };
    } catch {
      toast.error('Failed to update link');
      return { success: false };
    }
  }

  async function deleteLink(id: string) {
    try {
      const response = await fetch(`/api/v1/admin/links/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
        toast.success('Link deleted successfully');
        return { success: true };
      }
      return { success: false };
    } catch {
      toast.error('Failed to delete link');
      return { success: false };
    }
  }

  const stats = {
    total: links.length,
    visible: links.filter((l) => l.visible).length,
    hidden: links.filter((l) => !l.visible).length,
  };

  return {
    links,
    filteredLinks,
    loading,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    stats,
    toggleVisibility,
    createLink,
    updateLink,
    deleteLink,
  };
}
