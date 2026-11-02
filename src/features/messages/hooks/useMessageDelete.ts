import { useState } from 'react';
import type { AnonymousMessage } from '../types/messages.types';
import { logger } from '@/lib/utils/logger';

interface UseMessageDeleteOptions {
  deleteMessage: (id: string) => Promise<{ success: boolean }>;
  selectedMessage: AnonymousMessage | null;
  setSelectedMessage: (message: AnonymousMessage | null) => void;
}

export function useMessageDelete({
  deleteMessage,
  selectedMessage,
  setSelectedMessage,
}: UseMessageDeleteOptions) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openDeleteModal(id: string) {
    setMessageToDelete(id);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setMessageToDelete(null);
  }

  async function confirmDelete() {
    if (!messageToDelete) return;
    setIsDeleting(true);

    try {
      const result = await deleteMessage(messageToDelete);
      if (result.success) {
        if (selectedMessage?.id === messageToDelete) {
          setSelectedMessage(null);
        }
        closeDeleteModal();
      }
    } catch (error) {
      logger.error('Failed to delete message', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    deleteModalOpen,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
}
