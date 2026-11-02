import type { Metadata } from 'next';
import { ContactsPageContent } from './ContactsPageContent';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Manage contact forms, bookings, anonymous messages, guestbook entries, and contact settings.',
};

export default function ContactsPage() {
  return <ContactsPageContent />;
}
