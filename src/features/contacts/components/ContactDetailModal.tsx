'use client';

import { useState } from 'react';
import {
  EyeOff,
  Trash2,
  MailOpen,
  Mail,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  Circle,
  Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { formatDate } from '@/lib/utils/date';
import type { ContactForm } from '../types/contacts.types';
import { ContactReplyComposer } from './ContactReplyComposer';

interface ContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactForm | null;
  loading?: boolean;
  onToggleRead: (contact: ContactForm) => void;
  onDelete: (contact: ContactForm) => void;
  onReply: (contact: ContactForm, subject: string, message: string) => Promise<boolean>;
}

export function ContactDetailModal({
  open,
  onOpenChange,
  contact,
  loading = false,
  onToggleRead,
  onDelete,
  onReply,
}: ContactDetailModalProps) {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replySubject, setReplySubject] = useState('Re: Your message to NaufalRF Portfolio');
  const [replyMessage, setReplyMessage] = useState('');

  const handleToggleRead = () => {
    if (contact) {
      onToggleRead(contact);
    }
  };

  const handleDelete = () => {
    if (contact) {
      onDelete(contact);
    }
  };

  const handleReply = async () => {
    if (!contact || !replyMessage.trim()) {
      return;
    }

    setSendingReply(true);
    try {
      const success = await onReply(contact, replySubject, replyMessage);
      if (success) {
        setIsReplyModalOpen(false);
        setReplyMessage('');
      }
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Contact Submission"
      description={contact ? `From ${contact.name}` : undefined}
      size="lg"
      footer={
        contact && (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={handleToggleRead}>
              {contact.read ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Mark Unread
                </>
              ) : (
                <>
                  <MailOpen className="h-4 w-4 mr-2" />
                  Mark Read
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(true)}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      ) : contact ? (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-2xl bg-[var(--bg-elevated)]"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Name
                </span>
              </div>
              <p className="text-[var(--text-primary)] font-medium">{contact.name}</p>
            </div>

            <div
              className="p-4 rounded-2xl bg-[var(--bg-elevated)]"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Email
                </span>
              </div>
              <a
                href={`mailto:${contact.email}`}
                className="text-[var(--teal)] hover:underline font-medium"
              >
                {contact.email}
              </a>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl bg-[var(--bg-elevated)]"
            style={{
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Subject
              </span>
            </div>
            <p className="text-[var(--text-primary)]">
              {contact.subject || <span className="italic text-[var(--text-secondary)]">No subject</span>}
            </p>
          </div>

          <div
            className="p-4 rounded-2xl bg-[var(--bg-elevated)]"
            style={{
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Message
              </span>
            </div>
            <p className="text-[var(--text-primary)] whitespace-pre-wrap">{contact.message}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-line/20">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Clock className="h-4 w-4" />
              <span>
                {formatDate(contact.createdAt, 'long')}
              </span>
            </div>
            <div>
              {!contact.read ? (
                <Badge variant="warning">
                  <Circle className="h-3 w-3 fill-current" />
                  Unread
                </Badge>
              ) : contact.replied ? (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Replied
                </Badge>
              ) : (
                <Badge variant="default">
                  <CheckCircle2 className="h-3 w-3" />
                  Read
                </Badge>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ResponsiveModal
        open={isReplyModalOpen}
        onOpenChange={setIsReplyModalOpen}
        title="Reply to Contact"
        description={contact ? `Reply directly to ${contact.name} from the dashboard.` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReply}
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
    </ResponsiveModal>
  );
}
