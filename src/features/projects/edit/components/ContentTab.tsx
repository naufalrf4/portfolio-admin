'use client';

import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectEdit } from '../types';

interface ContentTabProps {
  content: string;
  onContentChange: (content: string) => void;
  saving: boolean;
  debouncedContent: string;
  project: ProjectEdit | null;
}

export function ContentTab({
  content,
  onContentChange,
  saving,
  debouncedContent,
  project,
}: ContentTabProps) {
  return (
    <div className="rounded-[var(--radius-container)] p-6 bg-[var(--bg-elevated)] shadow-surface-sunken">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Markdown Content</h3>
        {saving && (
          <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )}
        {!saving && debouncedContent === content && content !== (project?.content || '') && (
          <span className="text-sm text-green-600">Saved</span>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="# Project overview\n\nWrite the long-form project story in markdown..."
        className="min-h-[420px] resize-y rounded-[var(--radius-base)] border-0 bg-[var(--bg-elevated)] p-5 font-mono text-sm leading-7 text-[var(--text-primary)] shadow-surface-sunken focus-visible:ring-2 focus-visible:ring-[var(--teal)]/30"
      />
      <p className="text-xs text-[var(--text-secondary)] mt-3">
        Write markdown only. Content auto-saves and renders directly on the public project page.
      </p>
    </div>
  );
}
