import type { Metadata } from 'next';
import { ChatLogDetailPageContent } from './ChatLogDetailPageContent';

export const metadata: Metadata = {
  title: 'Chat Log Details',
  description: 'View chat conversation details',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatLogDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ChatLogDetailPageContent id={id} />;
}
