import type { Metadata } from 'next';
import { EditKnowledgePageContent } from './EditKnowledgePageContent';

export const metadata: Metadata = {
  title: 'Edit Knowledge Document',
  description: 'Edit an existing knowledge document',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditKnowledgePage({ params }: PageProps) {
  const { id } = await params;
  return <EditKnowledgePageContent id={id} />;
}
