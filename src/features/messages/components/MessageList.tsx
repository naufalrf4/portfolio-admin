import { MessageCard } from './MessageCard';
import type { AnonymousMessage } from '../types/messages.types';

interface MessageListProps {
  messages: AnonymousMessage[];
  onSelect: (message: AnonymousMessage) => void;
  onToggleRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

export function MessageList({ messages, onSelect, onToggleRead, onDelete }: MessageListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onSelect={() => onSelect(message)}
          onToggleRead={() => onToggleRead(message.id, message.read)}
          onDelete={() => onDelete(message.id)}
        />
      ))}
    </div>
  );
}
