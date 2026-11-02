'use client';

import { AlertTriangle } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  contactName,
}: DeleteConfirmModalProps) {
  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Delete Contact"
      description={
        contactName
          ? `Are you sure you want to delete this contact from ${contactName}? This action cannot be undone.`
          : 'Are you sure you want to delete this contact? This action cannot be undone.'
      }
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="surface-sunken w-16 h-16 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <div className="flex w-full gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
