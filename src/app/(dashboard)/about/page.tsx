import type { Metadata } from 'next';
import { AboutPageContent } from './AboutPageContent';

export const metadata: Metadata = {
  title: 'About Me',
  description: 'Manage your personal information, profile links, bio, skills, and experience',
};

export default function AboutMePage() {
  return <AboutPageContent />;
}
