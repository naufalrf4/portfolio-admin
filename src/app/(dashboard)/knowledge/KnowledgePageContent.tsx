'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { KnowledgeTable } from '@/components/knowledge';
import { ChatLogsTable } from '@/components/chat-logs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiConfigTab } from '@/features/knowledge/components';

interface KnowledgeDoc {
  id: string;
  filename: string;
  content: string;
  indexed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ChatLog {
  id: string;
  sessionId: string;
  messages: Array<{
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
  }>;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function KnowledgePageContent() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLogsLoading, setChatLogsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'chat-logs' | 'ai-config'>('documents');

  const fetchDocs = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/knowledge?limit=50');
      const data = await response.json();
      if (data.success) {
        setDocs(data.data.docs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      void error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/chat-logs?limit=50');
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
      }
    } catch (error) {
      void error;
    } finally {
      setChatLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocs();
    fetchLogs();
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setDocs((prev) => prev.filter((doc) => doc.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      void error;
      return false;
    }
  };

  const handleIngest = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}/ingest`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, indexed: true } : doc)));
        return true;
      }
      return false;
    } catch (error) {
      void error;
      return false;
    }
  };

  const handleDeleteLog = async (id: string): Promise<boolean> => {
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

  const indexedCount = docs.filter((d) => d.indexed).length;
  const pendingCount = docs.filter((d) => !d.indexed).length;
  const totalMessages = logs.reduce((acc, log) => acc + log.messageCount, 0);

  return (
    <PageWrapper>
      <PageHeader
        title="AI Service"
        description="Manage knowledge documents and AI chat history without the old freelance-side helper copy."
        icon={<FileText />}
        stats={[
          { label: 'Total', value: pagination?.total || docs.length },
          { label: 'Indexed', value: indexedCount, variant: 'success' },
          { label: 'Chat Messages', value: totalMessages },
          { label: 'Pending', value: pendingCount, variant: 'warning' },
        ]}
        actions={
          activeTab === 'documents' || activeTab === 'chat-logs' ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {activeTab === 'documents' ? (
                <Button variant="primary" asChild>
                  <Link href="/knowledge/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="documents">Knowledge Documents</TabsTrigger>
          <TabsTrigger value="chat-logs">Chat Logs</TabsTrigger>
          <TabsTrigger value="ai-config">AI Config</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <KnowledgeTable
            docs={docs}
            loading={loading}
            onDelete={handleDelete}
            onIngest={handleIngest}
          />
        </TabsContent>

        <TabsContent value="chat-logs">
          <ChatLogsTable logs={logs} loading={chatLogsLoading} onDelete={handleDeleteLog} />
        </TabsContent>

        <TabsContent value="ai-config">
          <AiConfigTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
