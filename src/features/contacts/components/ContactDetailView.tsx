import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ContactForm } from '../types/contacts.types';
import { ContactInfoSection } from './ContactInfoSection';
import { ContactActions } from '@/app/(dashboard)/contacts/[id]/ContactActions';

interface ContactDetailViewProps {
  contact: ContactForm;
}

export function ContactDetailView({ contact }: ContactDetailViewProps) {
  const reply = contact.metadata?.reply;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{contact.subject || 'Contact Form Submission'}</CardTitle>
            <CardDescription>From {contact.name}</CardDescription>
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              {contact.replied ? (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Replied
                </Badge>
              ) : contact.read ? (
                <Badge variant="default">Read</Badge>
              ) : (
                <Badge variant="warning">Unread</Badge>
              )}
            </div>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ContactInfoSection
            email={contact.email}
            createdAt={contact.createdAt}
            ipHash={contact.ipHash}
          />

          <div className="pt-4 border-t border-line/20">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Message</h3>
            <div
              className="p-4 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] whitespace-pre-wrap"
              style={{
                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {contact.message}
            </div>
          </div>

          {reply ? (
            <div className="pt-4 border-t border-line/20">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Latest Reply</h3>
              <div
                className="p-4 rounded-2xl bg-bg-elevated text-foreground whitespace-pre-wrap"
                style={{
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)] mb-2">
                  {reply.subject}
                </p>
                {reply.message}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <ContactActions contactId={contact.id} replied={contact.replied} />
      </CardFooter>
    </Card>
  );
}
