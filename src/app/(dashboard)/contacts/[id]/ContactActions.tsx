'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { ContactReplyComposer } from '@/features/contacts/components';
import { toast } from 'sonner';

interface ContactActionsProps {
  contactId: string;
  replied: boolean;
}

export function ContactActions({ contactId, replied }: ContactActionsProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [markingReplied, setMarkingReplied] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replySubject, setReplySubject] = useState('Re: Your message to NaufalRF Portfolio');
  const [replyMessage, setReplyMessage] = useState('');

  async function handleMarkAsReplied() {
    setMarkingReplied(true);
    try {
      const response = await fetch(`/api/v1/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replied: true }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contact marked as replied');
        router.refresh();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to mark as replied';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Failed to mark as replied');
    } finally {
      setMarkingReplied(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/contacts/${contactId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Contact deleted successfully');
        router.push('/contacts');
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to delete contact';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  }

  async function handleSendReply() {
    setSendingReply(true);
    try {
      const response = await fetch(`/api/v1/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replied: true,
          replySubject,
          replyMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Reply sent successfully');
        setIsReplyModalOpen(false);
        setReplyMessage('');
        router.refresh();
      } else {
        const errorMsg =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Failed to send reply';
        toast.error(errorMsg);
      }
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <Button variant="outline" onClick={() => setIsReplyModalOpen(true)} className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Reply via Email
        </Button>
        {!replied && (
          <Button
            variant="default"
            onClick={handleMarkAsReplied}
            disabled={markingReplied}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {markingReplied ? 'Marking...' : 'Mark as Replied'}
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => setIsDeleteModalOpen(true)}
          className={replied ? 'flex-1' : ''}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <ResponsiveModal
        open={isReplyModalOpen}
        onOpenChange={setIsReplyModalOpen}
        title="Reply to Contact"
        description="Send a direct reply from the dashboard using the portfolio SMTP sender."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendReply}
              disabled={sendingReply || !replyMessage.trim()}
            >
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </Button>
          </>
        }
      >
        <ContactReplyComposer
          subject={replySubject}
          message={replyMessage}
          onSubjectChange={setReplySubject}
          onMessageChange={setReplyMessage}
          disabled={sendingReply}
        />
      </ResponsiveModal>

      <ResponsiveModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Contact"
        description="Are you sure you want to delete this contact form submission?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-[var(--text-secondary)]">
            This will permanently delete the contact form submission and all associated data. This
            action cannot be undone.
          </p>
        </div>
      </ResponsiveModal>
    </>
  );
}
