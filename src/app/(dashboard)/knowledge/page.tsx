import type { Metadata } from 'next';
import { KnowledgePageContent } from './KnowledgePageContent';

export const metadata: Metadata = {
  title: 'AI Service',
  description: 'Manage knowledge documents and chat logs that support the portfolio AI service.',
};

export default function KnowledgePage() {
  return <KnowledgePageContent />;
}
