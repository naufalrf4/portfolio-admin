'use client';

import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ContactDetailView } from '@/features/contacts/components/ContactDetailView';
import type { ContactForm } from '@/features/contacts/types/contacts.types';

interface ContactDetailPageContentProps {
  contact: ContactForm;
}

export function ContactDetailPageContent({ contact }: ContactDetailPageContentProps) {
  return (
    <PageWrapper>
      <PageHeader
        title="Contact Message Details"
        description="View contact form submission information"
        icon={<MessageSquare />}
        back={{ href: '/contacts', label: 'Back to Contacts' }}
      />

      <div className="space-y-6">
        <ContactDetailView contact={contact} />
      </div>
    </PageWrapper>
  );
}
