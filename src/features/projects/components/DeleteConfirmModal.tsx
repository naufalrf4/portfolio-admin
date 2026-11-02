import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle?: string;
  onConfirm: () => void;
  deleting: boolean;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  projectTitle,
  onConfirm,
  deleting,
}: DeleteConfirmModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description={`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      }
    >
      <div className="py-4">
        <p className="text-[var(--text-secondary)]">
          This will permanently delete the project and all associated data.
        </p>
      </div>
    </ResponsiveModal>
  );
}
