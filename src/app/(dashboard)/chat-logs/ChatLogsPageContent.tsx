'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { ChatLogsTable } from '@/components/chat-logs';

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
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ChatLogsPageContent() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/chat-logs?limit=50');
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      void error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/admin/chat-logs/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setLogs((prev) => prev.filter((log) => log.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      void error;
      return false;
    }
  };

  const totalMessages = logs.reduce((acc, log) => acc + log.messageCount, 0);

  return (
    <PageWrapper>
      <PageHeader
        title="Chat Logs"
        description="Review portfolio Agentic Contextual RAG conversation logs"
        icon={<MessageSquare />}
        stats={[
          { label: 'Sessions', value: pagination?.total || logs.length },
          { label: 'Messages', value: totalMessages },
        ]}
        actions={
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <ChatLogsTable logs={logs} loading={loading} onDelete={handleDelete} />
    </PageWrapper>
  );
}
