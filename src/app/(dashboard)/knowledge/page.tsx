import type { Metadata } from 'next';
import { KnowledgePageContent } from './KnowledgePageContent';

export const metadata: Metadata = {
  title: 'Knowledge & Chat Logs',
  description: 'Manage assistant knowledge documents and chat history.',
};

export default function KnowledgePage() {
  return <KnowledgePageContent />;
}
