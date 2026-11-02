import type { Metadata } from 'next';
import { NewKnowledgePageContent } from './NewKnowledgePageContent';

export const metadata: Metadata = {
  title: 'New Knowledge Document',
  description: 'Create a new knowledge document for the AI knowledge workflow',
};

export default function NewKnowledgePage() {
  return <NewKnowledgePageContent />;
}
