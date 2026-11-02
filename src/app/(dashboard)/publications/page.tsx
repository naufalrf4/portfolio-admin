import type { Metadata } from 'next';
import { PublicationsPageContent } from './PublicationsPageContent';

export const metadata: Metadata = {
  title: 'Publications',
  description: 'Manage your publication links and writing destinations.',
};

export default function PublicationsPage() {
  return <PublicationsPageContent />;
}
