'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDate } from '@/lib/utils/date';

type ClearMode = 'last-n-days' | 'before-date' | 'all';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const DAY_PRESETS = [7, 30, 90] as const;

const LEVEL_OPTIONS: readonly { readonly value: LogLevel; readonly label: string }[] = [
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
];

interface ClearLogsDialogProps {
  onCleared?: () => void;
}

export function ClearLogsDialog({ onCleared }: ClearLogsDialogProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mode, setMode] = useState<ClearMode>('last-n-days');
  const [days, setDays] = useState<number>(30);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [levels, setLevels] = useState<readonly LogLevel[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canContinue =
    mode === 'last-n-days' ? days > 0 : mode === 'before-date' ? Boolean(beforeDate) : true;

  const levelSummary =
    levels.length === 0 || levels.length === LEVEL_OPTIONS.length
      ? 'all levels'
      : levels.join(', ');

  const rangeSummary =
    mode === 'last-n-days'
      ? `older than the last ${days} day${days === 1 ? '' : 's'}`
      : mode === 'before-date'
        ? `recorded before ${beforeDate ? formatDate(beforeDate, 'long') : 'the selected date'}`
        : 'from any date';

  const summary = `every log (${levelSummary}) ${rangeSummary}`;

  const resetSelection = () => {
    setMode('last-n-days');
    setDays(30);
    setBeforeDate(null);
    setLevels([]);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setSelectOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const levelFilter = levels.length > 0 ? { levels } : {};
      const body =
        mode === 'last-n-days'
          ? { mode: 'last-n-days' as const, days, ...levelFilter }
          : mode === 'before-date'
            ? {
                mode: 'before-date' as const,
                beforeDate: (beforeDate as Date).toISOString(),
                ...levelFilter,
              }
            : { mode: 'all' as const, ...levelFilter };

      const res = await fetch('/api/v1/admin/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          `Cleared ${json.data.deletedCount} log${json.data.deletedCount === 1 ? '' : 's'}`
        );
        setConfirmOpen(false);
        resetSelection();
        onCleared?.();
      } else {
        toast.error(json.error?.message ?? 'Failed to clear logs');
      }
    } catch {
      toast.error('Failed to clear logs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectOpen(true)}
        className="h-9 px-3 rounded-xl text-xs"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Clear Logs
      </Button>

      <Dialog open={selectOpen} onOpenChange={setSelectOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Clear Application Logs</DialogTitle>
            <DialogDescription>
              Choose which logs to permanently remove. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] surface-raised-sm">
              <Button
                type="button"
                variant={mode === 'last-n-days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('last-n-days')}
                className="h-8 flex-1 rounded-lg px-3 text-xs font-medium"
              >
                Last N Days
              </Button>
              <Button
                type="button"
                variant={mode === 'before-date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('before-date')}
                className="h-8 flex-1 rounded-lg px-3 text-xs font-medium"
              >
                Specific Date
              </Button>
              <Button
                type="button"
                variant={mode === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('all')}
                className="h-8 flex-1 rounded-lg px-3 text-xs font-medium"
              >
                All Time
              </Button>
            </div>

            {mode === 'last-n-days' ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  Delete every log entry older than the selected window.
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAY_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={days === preset ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setDays(preset)}
                      className="h-9 rounded-xl text-xs"
                    >
                      {preset} days
                    </Button>
                  ))}
                </div>
              </div>
            ) : mode === 'before-date' ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  Delete every log entry recorded before this date.
                </p>
                <DatePicker
                  value={beforeDate}
                  onChange={setBeforeDate}
                  placeholder="Select cutoff date"
                  maxDate={new Date()}
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">
                Delete matching log entries regardless of when they were recorded.
              </p>
            )}

            <div className="flex flex-col gap-2 border-t border-line-strong pt-4">
              <p className="text-xs font-medium text-[var(--text-primary)]">Levels</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Leave every level unchecked to clear all of them.
              </p>
              <div className="flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((option) => {
                  const isSelected = levels.includes(option.value);
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setLevels((prev) =>
                          prev.includes(option.value)
                            ? prev.filter((level) => level !== option.value)
                            : [...prev, option.value]
                        )
                      }
                      className="h-9 rounded-xl text-xs"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!submitting) setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
              Confirm log deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {summary}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={submitting}
              className="bg-[var(--error)] text-on-error hover:brightness-110"
            >
              {submitting ? 'Deleting…' : 'Delete Logs'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
