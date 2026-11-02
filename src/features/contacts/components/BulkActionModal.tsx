'use client';

import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import type { BulkAction } from '../types/contacts.types';

interface BulkActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkAction | null;
  count: number;
  onConfirm: () => void;
  isLoading: boolean;
}

const ACTION_LABELS: Record<BulkAction, { title: string; verb: string }> = {
  markRead: { title: 'Mark as Read', verb: 'mark as read' },
  markUnread: { title: 'Mark as Unread', verb: 'mark as unread' },
  delete: { title: 'Delete', verb: 'delete' },
};

export function BulkActionModal({
  open,
  onOpenChange,
  action,
  count,
  onConfirm,
  isLoading,
}: BulkActionModalProps) {
  if (!action) return null;

  const { title, verb } = ACTION_LABELS[action];
  const isDelete = action === 'delete';

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Bulk ${title}`}
      description={`Are you sure you want to ${verb} ${count} contact(s)?`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isDelete ? 'destructive' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : title}
          </Button>
        </>
      }
    >
      <div className="py-4">
        <p className="text-[var(--text-secondary)]">
          {isDelete
            ? 'This action cannot be undone. All selected contacts will be permanently deleted.'
            : `All selected contacts will be marked as ${action === 'markRead' ? 'read' : 'unread'}.`}
        </p>
      </div>
    </ResponsiveModal>
  );
}
