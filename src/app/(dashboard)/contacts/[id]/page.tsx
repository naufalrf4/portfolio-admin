import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContactById, markContactAsRead } from '@/features/contacts/services';
import { ContactDetailPageContent } from './ContactDetailPageContent';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    return {
      title: 'Contact Not Found',
    };
  }

  return {
    title: `Contact from ${contact.name}`,
    description: `Contact submission from ${contact.email}${contact.subject ? ` - ${contact.subject}` : ''}`,
  };
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  if (!contact.read) {
    await markContactAsRead(id);
  }

  return <ContactDetailPageContent contact={contact} />;
}
