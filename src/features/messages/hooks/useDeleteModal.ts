import { useState } from 'react';

export function useDeleteModal() {
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

  return {
    deleteModalOpen,
    messageToDelete,
    isDeleting,
    setIsDeleting,
    openDeleteModal,
    closeDeleteModal,
  };
}
