'use client';

import { useState, useTransition } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
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
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils';
import type { AppLogRow } from '../types/logs.types';
import { LevelBadge } from './LevelBadge';
import { LogsEmptyState } from './LogsEmptyState';
import { LogsTableSkeleton } from './LogsTableSkeleton';

interface LogsTableProps {
  logs: AppLogRow[];
  loading: boolean;
  nextCursor: string | null;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRefresh: () => void;
  className?: string;
}

export function LogsTable({
  logs,
  loading,
  nextCursor,
  hasPrevious,
  onNext,
  onPrevious,
  onRefresh,
  className,
}: LogsTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    startTransition(() => {
      setCopiedKey(key);
    });
    setTimeout(() => {
      startTransition(() => {
        setCopiedKey(null);
      });
    }, 2000);
  };

  if (loading && logs.length === 0) {
    return <LogsTableSkeleton rowCount={8} className={className} />;
  }

  if (logs.length === 0) {
    return <LogsEmptyState className={className} />;
  }

  return (
    <Card
      className={cn(
        'flex flex-col gap-4 rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm p-4 border border-border/40',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          Showing {logs.length} entries
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 px-2.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Table className="text-left text-xs border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border/40 text-[var(--text-secondary)] font-medium">
              <TableHead className="h-auto py-2.5 px-3 w-8" />
              <TableHead className="h-auto py-2.5 px-3 w-40">Timestamp (WIB)</TableHead>
              <TableHead className="h-auto py-2.5 px-3 w-20">Level</TableHead>
              <TableHead className="h-auto py-2.5 px-3 w-32">Service</TableHead>
              <TableHead className="h-auto py-2.5 px-3">Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/20">
            {logs.map((log) => {
              const isExpanded = expandedRowId === log.id;
              return (
                <LogRowItem
                  key={log.id}
                  log={log}
                  isExpanded={isExpanded}
                  onToggle={() => toggleRow(log.id)}
                  copiedKey={copiedKey}
                  onCopy={handleCopy}
                />
              );
            })}
          </TableBody>
      </Table>

      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious || loading}
          className="h-8 rounded-xl text-xs"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!nextCursor || loading}
          className="h-8 rounded-xl text-xs"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

interface LogRowItemProps {
  log: AppLogRow;
  isExpanded: boolean;
  onToggle: () => void;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}

function LogRowItem({
  log,
  isExpanded,
  onToggle,
  copiedKey,
  onCopy,
}: LogRowItemProps) {
  const contextJson =
    log.context !== null && log.context !== undefined
      ? JSON.stringify(log.context, null, 2)
      : null;

  return (
    <>
      <TableRow
        onClick={onToggle}
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/30 group',
          isExpanded && 'bg-muted/20'
        )}
      >
        <TableCell className="py-2.5 px-3 text-[var(--text-secondary)]">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="py-2.5 px-3 font-mono text-[var(--text-secondary)] whitespace-nowrap">
          {formatDateTime(log.timestamp)}
        </TableCell>
        <TableCell className="py-2.5 px-3">
          <LevelBadge level={log.level} />
        </TableCell>
        <TableCell className="py-2.5 px-3 font-mono text-[var(--text-secondary)]">
          <span className="px-1.5 py-0.5 rounded bg-muted/40 text-[11px]">
            {log.service}
          </span>
        </TableCell>
        <TableCell className="py-2.5 px-3 text-[var(--text-primary)] font-medium truncate max-w-md">
          {log.message}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-muted/10">
          <TableCell colSpan={5} className="p-4">
            <div className="flex flex-col gap-3 text-xs bg-[var(--bg)] p-4 rounded-xl border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-3 border-b border-border/30">
                <div>
                  <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                    Log ID
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[var(--text-primary)]">
                    <span className="truncate">{log.id}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(`id-${log.id}`, log.id);
                      }}
                      className="h-6 w-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {copiedKey === `id-${log.id}` ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {log.correlationId && (
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                      Correlation ID
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[var(--text-primary)]">
                      <span className="truncate">{log.correlationId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(`corr-${log.id}`, log.correlationId!);
                        }}
                        className="h-6 w-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {copiedKey === `corr-${log.id}` ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {log.route && (
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                      Route
                    </span>
                    <span className="font-mono text-[var(--text-primary)] truncate block">
                      {log.route}
                    </span>
                  </div>
                )}

                {log.statusCode !== null && (
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                      Status Code
                    </span>
                    <span className="font-mono text-[var(--text-primary)]">
                      {log.statusCode}
                    </span>
                  </div>
                )}

                {log.durationMs !== null && (
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                      Duration
                    </span>
                    <span className="font-mono text-[var(--text-primary)]">
                      {log.durationMs} ms
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[var(--text-secondary)] block text-[11px] mb-0.5">
                    Received At (WIB)
                  </span>
                  <span className="font-mono text-[var(--text-secondary)]">
                    {formatDateTime(log.receivedAt)}
                  </span>
                </div>
              </div>

              {contextJson && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[var(--text-primary)] text-[11px]">
                      Context
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(`ctx-${log.id}`, contextJson);
                      }}
                      className="h-7 px-2 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {copiedKey === `ctx-${log.id}` ? (
                        <>
                          <Check className="h-3 w-3 text-success" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-border/40 font-mono text-[11px] text-[var(--text-primary)] overflow-x-auto max-h-60">
                    {contextJson}
                  </pre>
                </div>
              )}

              {(log.errorName || log.errorMessage || log.errorStack) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-destructive text-[11px]">
                      Error Details: {log.errorName || 'Error'}
                    </span>
                    {log.errorStack && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(`stack-${log.id}`, log.errorStack!);
                        }}
                        className="h-7 px-2 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {copiedKey === `stack-${log.id}` ? (
                          <>
                            <Check className="h-3 w-3 text-success" /> Copied Stack
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy Stack
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {log.errorMessage && (
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive font-mono text-[11px]">
                      {log.errorMessage}
                    </div>
                  )}
                  {log.errorStack && (
                    <pre className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-destructive/20 font-mono text-[11px] text-destructive/90 overflow-x-auto max-h-60 whitespace-pre-wrap">
                      {log.errorStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
