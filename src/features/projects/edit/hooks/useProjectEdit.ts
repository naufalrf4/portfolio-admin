'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { getErrorMessage } from '@/lib/utils/api';
import type { ProjectEdit } from '../types';

type JsonMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type JsonNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
  marks?: JsonMark[];
  text?: string;
};

function toMarkdownFromMarks(text: string, marks?: JsonMark[]): string {
  return (marks ?? []).reduce((value, mark) => {
    if (mark.type === 'bold') {
      return `**${value}**`;
    }
    if (mark.type === 'italic') {
      return `*${value}*`;
    }
    if (mark.type === 'code') {
      return `\`${value}\``;
    }
    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      return href ? `[${value}](${href})` : value;
    }
    return value;
  }, text);
}

function renderInline(nodes?: JsonNode[]): string {
  return (nodes ?? [])
    .map((node) => {
      if (node.type === 'text') {
        return toMarkdownFromMarks(node.text ?? '', node.marks);
      }
      if (node.type === 'hardBreak') {
        return '  \n';
      }
      return renderInline(node.content);
    })
    .join('');
}

function renderBlock(node: JsonNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderBlock).filter(Boolean).join('\n\n');
    case 'paragraph':
      return renderInline(node.content).trim();
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
      const safeLevel = Math.min(Math.max(level, 1), 6);
      return `${'#'.repeat(safeLevel)} ${renderInline(node.content).trim()}`;
    }
    case 'bulletList':
      return (node.content ?? [])
        .map((item) => renderListItem(item, '-'))
        .filter(Boolean)
        .join('\n');
    case 'orderedList':
      return (node.content ?? [])
        .map((item, index) => renderListItem(item, `${index + 1}.`))
        .filter(Boolean)
        .join('\n');
    case 'blockquote':
      return (node.content ?? [])
        .map(renderBlock)
        .filter(Boolean)
        .map((line) =>
          line
            .split('\n')
            .map((part) => `> ${part}`)
            .join('\n')
        )
        .join('\n');
    case 'codeBlock': {
      const code = (node.content ?? [])
        .map((child) => (child.type === 'text' ? (child.text ?? '') : renderInline(child.content)))
        .join('');
      return `\`\`\`\n${code}\n\`\`\``;
    }
    case 'horizontalRule':
      return '---';
    case 'image': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : 'Project image';
      return src ? `![${alt}](${src})` : '';
    }
    default:
      return renderInline(node.content).trim();
  }
}

function renderListItem(node: JsonNode, marker: string): string {
  const content = (node.content ?? []).map(renderBlock).filter(Boolean);
  if (content.length === 0) {
    return '';
  }

  const [first, ...rest] = content;
  const trailing = rest.map((line) => `  ${line.replace(/\n/g, '\n  ')}`).join('\n');
  return trailing ? `${marker} ${first}\n${trailing}` : `${marker} ${first}`;
}

function extractLeadingJsonDocument(value: string): { json: string; rest: string | null } | null {
  const input = value.trim();
  if (!input.startsWith('{')) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        const json = input.slice(0, index + 1);
        const rest = input.slice(index + 1).trim();
        return { json, rest: rest || null };
      }
    }
  }

  return null;
}

function parseJsonSafely(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toEditableMarkdown(value: string | null): string {
  if (!value) {
    return '';
  }

  const hybrid = extractLeadingJsonDocument(value);
  if (hybrid) {
    const parsed = parseJsonSafely(hybrid.json);
    if (parsed && typeof parsed === 'object' && (parsed as JsonNode).type === 'doc') {
      const markdown = renderBlock(parsed as JsonNode).trim();
      return [markdown, hybrid.rest].filter(Boolean).join('\n\n---\n\n');
    }
  }

  const parsed = parseJsonSafely(value.trim());
  if (parsed && typeof parsed === 'object' && (parsed as JsonNode).type === 'doc') {
    return renderBlock(parsed as JsonNode).trim();
  }

  return value;
}

export function useProjectEdit(id: string) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectEdit | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [debouncedContent] = useDebounce(content, 1000);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/projects/${id}`);
      const data = await response.json();

      if (!data.success) {
        toast.error('Project not found');
        router.push('/projects');
        return;
      }

      const projectData = data.data as ProjectEdit;
      const normalizedContent = toEditableMarkdown(projectData.content);
      setProject({ ...projectData, content: normalizedContent });
      setContent(normalizedContent);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const saveContent = useCallback(
    async (newContent: string) => {
      if (!project) return;

      setSaving(true);
      try {
        const response = await fetch(`/api/v1/admin/projects/${project.id}/content`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to save content');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to save content');
        }

        setProject({ ...project, content: newContent });
        toast.success('Content saved');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to save content'));
      } finally {
        setSaving(false);
      }
    },
    [project]
  );

  useEffect(() => {
    void fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project && debouncedContent !== (project.content || '')) {
      void saveContent(debouncedContent);
    }
  }, [debouncedContent, project, saveContent]);

  return {
    project,
    loading,
    content,
    setContent,
    saving,
    debouncedContent,
    fetchProject,
  };
}
