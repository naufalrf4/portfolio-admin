'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { ChatConversation } from '@/components/chat-logs';
import { DeleteConfirmModal } from '@/components/chat-logs/DeleteConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    duration?: number;
  };
}

interface ChatLog {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatLogDetailPageContentProps {
  id: string;
}

export function ChatLogDetailPageContent({ id }: ChatLogDetailPageContentProps) {
  const router = useRouter();
  const [log, setLog] = useState<ChatLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/chat-logs/${id}`);
      const data = await response.json();
      if (data.success) {
        setLog(data.data);
      } else {
        setError('Chat log not found');
      }
    } catch (error) {
      void error;
      setError('Failed to load chat log');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/chat-logs/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        router.push('/chat-logs');
      }
    } catch (error) {
      void error;
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-3/4 ml-auto" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-3/4 ml-auto" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (error || !log) {
    return (
      <PageWrapper>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Chat Log Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            {error || 'The requested chat log could not be found.'}
          </p>
          <Button onClick={() => router.push('/chat-logs')}>Back to Chat Logs</Button>
        </Card>
      </PageWrapper>
    );
  }

  const messages = log.messages as ChatMessage[];

  return (
    <PageWrapper>
      <PageHeader
        title="Chat Log Details"
        description={`Session: ${log.sessionId.substring(0, 16)}...`}
        icon={<MessageSquare />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/chat-logs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <ChatConversation
        sessionId={log.sessionId}
        messages={messages}
        createdAt={log.createdAt}
        updatedAt={log.updatedAt}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </PageWrapper>
  );
}
