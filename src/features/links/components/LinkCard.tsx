import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { ProfileLink } from '../types/links.types';
import { getIconData } from '../utils/links.utils';

interface LinkCardProps {
  link: ProfileLink;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export function LinkCard({ link, index, onEdit, onDelete, onToggleVisibility }: LinkCardProps) {
  const { icon: IconComponent, color } = getIconData(link.icon);

  return (
    <div
      className="group relative rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center border border-line-strong text-white"
          style={{ backgroundColor: color }}
        >
          <IconComponent className="h-7 w-7" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-all duration-200 hover:shadow-surface-raised-sm"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-destructive transition-all duration-200 hover:shadow-surface-raised-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-1">{link.label}</h3>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--teal)] flex items-center gap-1 mb-4 truncate"
      >
        <span className="truncate">{link.url}</span>
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--text-secondary)]/10">
        <div className="flex items-center gap-3">
          <Switch
            checked={link.visible}
            onCheckedChange={onToggleVisibility}
            aria-label={link.visible ? 'Hide link' : 'Show link'}
          />
          <span className="text-xs text-[var(--text-secondary)]">
            {link.visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        <Badge variant="outline" className="capitalize text-xs">
          {link.icon || 'custom'}
        </Badge>
      </div>
    </div>
  );
}
