'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CreateBlogLinkInput } from '@/lib/validations/blog-link.schema';
import type { PublicationLink, FilterType } from '../types/publications.types';

export function usePublications() {
  const [publicationLinks, setPublicationLinks] = useState<PublicationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPublicationLink, setEditingPublicationLink] = useState<PublicationLink | null>(null);
  const [deletingPublicationLink, setDeletingPublicationLink] = useState<PublicationLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPublicationLinks() {
      try {
        const response = await fetch('/api/v1/admin/blogs', {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) {
          setPublicationLinks(data.data.blogLinks);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to load publication links');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublicationLinks();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredPublicationLinks = publicationLinks.filter((link) => {
    if (filter === 'visible') return link.visible;
    if (filter === 'hidden') return !link.visible;
    return true;
  });

  const toggleVisibility = useCallback(async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/v1/admin/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !currentValue }),
      });
      const data = await response.json();
      if (data.success) {
        setPublicationLinks((prev) =>
          prev.map((b) => (b.id === id ? { ...b, visible: !currentValue } : b))
        );
        toast.success('Publication visibility updated');
      }
    } catch {
      toast.error('Failed to update visibility');
    }
  }, []);

  const createPublicationLink = useCallback(async (input: CreateBlogLinkInput) => {
    try {
      const payload = {
        ...input,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
      };

      const response = await fetch('/api/v1/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setPublicationLinks((prev) => [...prev, result.data]);
        setIsCreateModalOpen(false);
        toast.success('Publication link created successfully');
        return { success: true };
      }
      toast.error('Failed to create publication link');
      return { success: false };
    } catch {
      toast.error('Failed to create publication link');
      return { success: false };
    }
  }, []);

  const updatePublicationLink = useCallback(async (id: string, input: CreateBlogLinkInput) => {
    try {
      const payload = {
        ...input,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
      };

      const response = await fetch(`/api/v1/admin/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setPublicationLinks((prev) => prev.map((b) => (b.id === id ? result.data : b)));
        setIsEditModalOpen(false);
        setEditingPublicationLink(null);
        toast.success('Publication link updated successfully');
        return { success: true };
      }
      toast.error('Failed to update publication link');
      return { success: false };
    } catch {
      toast.error('Failed to update publication link');
      return { success: false };
    }
  }, []);

  const deletePublicationLink = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setPublicationLinks((prev) => prev.filter((b) => b.id !== id));
        setIsDeleteModalOpen(false);
        setDeletingPublicationLink(null);
        toast.success('Publication link deleted successfully');
        return { success: true };
      }
      toast.error('Failed to delete publication link');
      return { success: false };
    } catch {
      toast.error('Failed to delete publication link');
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const openEditModal = useCallback((publicationLink: PublicationLink) => {
    setEditingPublicationLink(publicationLink);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((publicationLink: PublicationLink) => {
    setDeletingPublicationLink(publicationLink);
    setIsDeleteModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPublicationLink(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingPublicationLink(null);
  }, []);

  return {
    publicationLinks,
    filteredPublicationLinks,
    loading,
    filter,
    setFilter,
    toggleVisibility,
    createPublicationLink,
    updatePublicationLink,
    deletePublicationLink,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    editingPublicationLink,
    deletingPublicationLink,
    isDeleting,
    openEditModal,
    openDeleteModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal,
  };
}
