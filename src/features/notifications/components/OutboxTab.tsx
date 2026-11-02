'use client';

import React, { useState } from 'react';
import { RotateCw, RefreshCw, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils/date';
import {
  OUTBOX_STATUS_OPTIONS,
  OUTBOX_CHANNEL_OPTIONS,
  OUTBOX_LIMIT_OPTIONS,
  CHANNEL_LABELS,
  getEventTypeLabel,
  STATUS_BADGE_VARIANTS,
} from '../constants/notifications.constants';
import type { OutboxRow } from '../types/notifications.types';

interface OutboxTabProps {
  rows: readonly OutboxRow[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  channelFilter: string;
  setChannelFilter: (channel: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  retryingId: string | null;
  onRetry: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function OutboxTab({
  rows,
  loading,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter,
  limit,
  setLimit,
  retryingId,
  onRetry,
  onRefresh,
}: OutboxTabProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Notification Outbox</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Mirrored push and Telegram delivery attempts with retry tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="h-9 text-xs">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                {OUTBOX_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger size="sm" className="h-9 text-xs">
                <SelectValue placeholder="Channel Filter" />
              </SelectTrigger>
              <SelectContent>
                {OUTBOX_CHANNEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
              <SelectTrigger size="sm" className="h-9 text-xs">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {OUTBOX_LIMIT_OPTIONS.map((lim) => (
                  <SelectItem key={lim} value={String(lim)}>
                    {lim} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh()}
            disabled={loading}
            className="h-9 px-3 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-[var(--bg-card)] surface-raised">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Attempts</TableHead>
              <TableHead>Created (WIB)</TableHead>
              <TableHead>Sent / Next Attempt (WIB)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[var(--text-secondary)]">
                  Loading outbox...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-[var(--text-secondary)]">
                  No notification outbox records found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const canRetry = row.status === 'failed' || row.status === 'dead';
                const isExpanded = expandedRowId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <TableRow className={isExpanded ? 'bg-[var(--bg-elevated)]/40' : undefined}>
                      <TableCell className="p-2">
                        {row.lastError ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleExpand(row.id)}
                            className="h-6 w-6 p-0 text-[var(--text-secondary)]"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            <span className="sr-only">Toggle error details</span>
                          </Button>
                        ) : null}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-[var(--text-primary)]">
                        {getEventTypeLabel(row.eventType)}
                      </TableCell>

                      <TableCell className="text-xs">
                        <span className="font-medium text-[var(--text-primary)]">
                          {CHANNEL_LABELS[row.channel]}
                        </span>
                        {row.channelName ? <span className="ml-1 text-[var(--text-tertiary)]">· {row.channelName}</span> : null}
                      </TableCell>

                      <TableCell className="max-w-48 truncate font-mono text-xs text-[var(--text-secondary)]" title={row.target ?? undefined}>
                        {row.target ?? row.channelId ?? '—'}
                      </TableCell>

                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANTS[row.status]}>
                          {row.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-[var(--text-secondary)]">
                        {row.attempts}
                      </TableCell>

                      <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                        {formatDateTime(row.createdAt)}
                      </TableCell>

                      <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                        {row.sentAt ? (
                          <span className="text-[var(--teal)]">{formatDateTime(row.sentAt)}</span>
                        ) : (
                          <span>Next: {formatDateTime(row.nextAttemptAt)}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {canRetry ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetry(row.id)}
                            disabled={retryingId === row.id}
                            className="h-8 px-2.5 text-xs text-[var(--teal)] hover:bg-[var(--teal)]/10"
                            title="Re-queues notification for next delivery attempt"
                          >
                            <RotateCw className={`h-3 w-3 mr-1 ${retryingId === row.id ? 'animate-spin' : ''}`} />
                            {retryingId === row.id ? 'Re-queuing...' : 'Re-queue'}
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] italic">
                            {row.status === 'sent' ? 'Delivered' : 'In queue'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && row.lastError ? (
                      <TableRow className="bg-[var(--bg-elevated)]/60">
                        <TableCell colSpan={9} className="p-4">
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs">
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                              <span className="font-semibold text-destructive">Last Delivery Error</span>
                              <pre className="font-mono text-[11px] text-[var(--text-primary)] whitespace-pre-wrap break-all bg-[var(--bg-card)] p-2 rounded-lg border border-line-strong">
                                {row.lastError}
                              </pre>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
