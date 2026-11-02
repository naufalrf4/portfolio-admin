'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, MessageSquare, Clock, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/date';

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

interface ChatLogsTableProps {
  logs: ChatLog[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

export function ChatLogsTable({ logs, loading, onDelete }: ChatLogsTableProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLog, setDeletingLog] = useState<ChatLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (log: ChatLog) => {
    setDeletingLog(log);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingLog) return;
    setIsDeleting(true);
    try {
      const success = await onDelete(deletingLog.id);
      if (success) {
        setDeleteModalOpen(false);
        setDeletingLog(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const truncateSessionId = (sessionId: string) => {
    if (sessionId.length <= 16) return sessionId;
    return `${sessionId.substring(0, 8)}...${sessionId.substring(sessionId.length - 4)}`;
  };

  const formatDate = (dateString: string | null) => {
    return formatDateTime(dateString);
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div
          className={cn(
            'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
            'bg-[var(--bg-elevated)]',
            'shadow-surface-sunken'
          )}
        >
          <MessageSquare className="h-8 w-8 text-[var(--text-secondary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Chat Logs</h3>
        <p className="text-[var(--text-secondary)]">
          Chat conversations will appear here when users interact with the AI assistant.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-line">
              <TableHead className="text-[var(--text-secondary)]">Session ID</TableHead>
              <TableHead className="text-[var(--text-secondary)]">Messages</TableHead>
              <TableHead className="text-[var(--text-secondary)]">Last Activity</TableHead>
              <TableHead className="text-[var(--text-secondary)] hidden md:table-cell">Created</TableHead>
              <TableHead className="text-[var(--text-secondary)] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="border-b border-line/50 hover:bg-[var(--bg-elevated)]/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/chat-logs/${log.id}`)}
              >
                <TableCell className="font-mono text-sm text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-[var(--teal)]" />
                    {truncateSessionId(log.sessionId)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-primary)] font-medium">{log.messageCount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(log.lastMessageAt || log.updatedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-[var(--text-secondary)] text-sm hidden md:table-cell">
                  {formatDate(log.createdAt)}
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => router.push(`/chat-logs/${log.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openDeleteModal(log)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        sessionId={deletingLog?.sessionId}
      />
    </>
  );
}
