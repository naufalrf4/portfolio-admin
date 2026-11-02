import type { Metadata } from 'next';
import { LinksPageContent } from './LinksPageContent';

export const metadata: Metadata = {
  title: 'Profile Links',
  description: 'Manage your social media and contact links',
};

export default function ProfileLinksPage() {
  return <LinksPageContent />;
}
