import type { Metadata } from 'next';
import { ChatLogsPageContent } from './ChatLogsPageContent';

export const metadata: Metadata = {
  title: 'RAG Service Chat Logs',
  description: 'View and manage AI assistant chat conversation logs from the RAG Service workflow',
};

export default function ChatLogsPage() {
  return <ChatLogsPageContent />;
}
