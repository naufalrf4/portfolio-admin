'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ContactReplyComposerProps {
  subject: string;
  message: string;
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  disabled?: boolean;
}

export function ContactReplyComposer({
  subject,
  message,
  onSubjectChange,
  onMessageChange,
  disabled = false,
}: ContactReplyComposerProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">Subject</label>
        <Input
          value={subject}
          onChange={(event) => onSubjectChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">Reply message</label>
        <Textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          rows={8}
          placeholder="Write a helpful, user-centered reply..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}
