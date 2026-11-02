'use client';

import { AlertTriangle } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Delete Publication Link"
      description={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="surface-sunken w-16 h-16 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

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
