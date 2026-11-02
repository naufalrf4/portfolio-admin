'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/date';

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

interface ChatConversationProps {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export function ChatConversation({
  sessionId,
  messages,
  createdAt,
  updatedAt,
}: ChatConversationProps) {
  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  const totalTokens = messages.reduce((acc, m) => {
    return acc + (m.metadata?.tokens || 0);
  }, 0);

  const models = [
    ...new Set(messages.filter((m) => m.metadata?.model).map((m) => m.metadata!.model!)),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[var(--teal)]" />
                Chat Session
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-1">{sessionId}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{messages.length} messages</Badge>
              {totalTokens > 0 && <Badge variant="primary">{totalTokens} tokens</Badge>}
              {models.map((model) => (
                <Badge key={model} variant="outline">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] p-4 rounded-xl',
              'bg-[var(--bg-elevated)]',
              'shadow-surface-sunken'
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Started: {formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last activity: {formatDate(updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>
                {userMessages.length} user / {assistantMessages.length} assistant
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                No messages in this conversation.
              </div>
            ) : (
              messages.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
