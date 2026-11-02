'use client';

import { AlertTriangle } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  filename?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  filename,
}: DeleteConfirmModalProps) {
  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Delete Knowledge Document"
      description={
        filename
          ? `Are you sure you want to delete "${filename}"? This action cannot be undone and will remove the document from the RAG system.`
          : 'Are you sure you want to delete this document? This action cannot be undone and will remove the document from the RAG system.'
      }
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="surface-sunken w-16 h-16 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          This will permanently delete the document and remove all vector embeddings from the
          knowledge base.
        </p>

        <div className="flex w-full gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
