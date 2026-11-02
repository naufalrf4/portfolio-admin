'use client';

import { AlertTriangle } from 'lucide-react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  linkLabel: string;
  deleting: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  linkLabel,
  deleting,
}: DeleteConfirmModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Link"
      description={`Are you sure you want to delete "${linkLabel}"? This action cannot be undone.`}
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="surface-sunken w-16 h-16 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <div className="flex w-full gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting} className="flex-1">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
