'use client';

import { Eye, EyeOff, Trash2, MailOpen, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ContactForm } from '../types/contacts.types';
import { formatDate } from '@/lib/utils/date';

interface ContactTableProps {
  contacts: ContactForm[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onView: (id: string) => void;
  onToggleRead: (contact: ContactForm) => void;
  onDelete: (contact: ContactForm) => void;
}

export function ContactTable({
  contacts,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onToggleRead,
  onDelete,
}: ContactTableProps) {
  const isAllSelected = selectedIds.size === contacts.length && contacts.length > 0;

  return (
    <div className="rounded-[var(--radius-container)] overflow-hidden border-[var(--border)] bg-[var(--bg-card)]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-6 py-4 text-left">
                <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Date</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--text-primary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <TooltipProvider key={contact.id}>
                <tr
                  className={cn(
                    'border-b border-line/10 last:border-0 cursor-pointer transition-colors',
                    !contact.read && 'bg-[var(--teal)]/5'
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, input')) return;
                    onView(contact.id);
                  }}
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => onSelectOne(contact.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!contact.read ? (
                        <Badge variant="warning">
                          <Circle className="h-3 w-3 fill-current" />
                          Unread
                        </Badge>
                      ) : contact.replied ? (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3" />
                          Replied
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3" />
                          Read
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={cn('font-medium text-[var(--text-primary)]', !contact.read && 'font-semibold')}
                    >
                      {contact.name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{contact.email}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[var(--text-primary)] line-clamp-1">
                      {contact.subject || <span className="italic text-[var(--text-secondary)]">No subject</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {formatDate(contact.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(contact.id);
                            }}
                            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleRead(contact);
                            }}
                            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--teal)] transition-colors"
                          >
                            {contact.read ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <MailOpen className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {contact.read ? 'Mark as unread' : 'Mark as read'}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(contact);
                            }}
                            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              </TooltipProvider>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
