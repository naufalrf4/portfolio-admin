import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GripVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { ProfileLink } from '../types/links.types';
import { getIconData } from '../utils/links.utils';

interface LinkTableProps {
  links: ProfileLink[];
  onEdit: (link: ProfileLink) => void;
  onDelete: (link: ProfileLink) => void;
  onToggleVisibility: (link: ProfileLink) => void;
}

export function LinkTable({ links, onEdit, onDelete, onToggleVisibility }: LinkTableProps) {
  return (
    <div
      className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] overflow-hidden"
      style={{
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[var(--text-secondary)]/10">
            <TableHead className="w-10 text-[var(--text-secondary)]">
              <GripVertical className="h-4 w-4" />
            </TableHead>
            <TableHead className="text-[var(--text-secondary)] font-medium">Platform</TableHead>
            <TableHead className="text-[var(--text-secondary)] font-medium">Label</TableHead>
            <TableHead className="text-[var(--text-secondary)] font-medium">URL</TableHead>
            <TableHead className="text-[var(--text-secondary)] font-medium text-center">Visible</TableHead>
            <TableHead className="text-[var(--text-secondary)] font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => {
            const { icon: IconComponent, color } = getIconData(link.icon);
            return (
              <TableRow
                key={link.id}
                className="border-b border-[var(--text-secondary)]/10 hover:bg-[var(--bg-elevated)]/50 transition-colors"
              >
                <TableCell>
                  <GripVertical className="h-4 w-4 text-[var(--text-secondary)]/50 cursor-grab" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-line-strong text-white"
                      style={{ backgroundColor: color }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {link.icon || 'custom'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-[var(--text-primary)]">{link.label}</p>
                </TableCell>
                <TableCell>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--teal)] flex items-center gap-1 max-w-[200px] truncate"
                  >
                    {link.url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={link.visible}
                    onCheckedChange={() => onToggleVisibility(link)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(link)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(link)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
