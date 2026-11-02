'use client';

import { useState } from 'react';
import {
  SlidersHorizontal,
  Info,
  Layers,
  Database,
  Calendar,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type {
  LogCaptureSettings,
  LogLevel,
  LogService,
  LogCounts,
  RetentionDays,
  ServiceOverrides,
} from '../types/logs.types';

interface LogSettingsPanelProps {
  settings: LogCaptureSettings | null;
  counts: LogCounts;
  saving: boolean;
  onSave: (update: {
    minLevel?: LogLevel;
    enabled?: boolean;
    serviceOverrides?: ServiceOverrides;
    retentionDays?: RetentionDays;
  }) => Promise<boolean>;
  onReset: () => void;
  className?: string;
}

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const SERVICES: LogService[] = [
  'admin',
  'public-astro',
  'links-astro',
  'ngl-svelte',
  'rag-service',
];

export function LogSettingsPanel({
  settings,
  counts,
  saving,
  onSave,
  onReset,
  className,
}: LogSettingsPanelProps) {
  const [enabled, setEnabled] = useState<boolean>(settings?.enabled ?? true);
  const [minLevel, setMinLevel] = useState<LogLevel>(settings?.minLevel ?? 'info');
  const [serviceOverrides, setServiceOverrides] = useState<ServiceOverrides>(
    settings?.serviceOverrides ?? {}
  );
  const [retentionDays, setRetentionDays] = useState<RetentionDays>(
    settings?.retentionDays ?? { debug: 3, info: 7, warn: 30, error: 90 }
  );

  const [hasChanges, setHasChanges] = useState(false);

  const handleLevelChange = (lvl: LogLevel) => {
    setMinLevel(lvl);
    setHasChanges(true);
  };

  const handleEnabledToggle = (val: boolean) => {
    setEnabled(val);
    setHasChanges(true);
  };

  const handleServiceOverride = (srv: LogService, lvl: LogLevel | '') => {
    setServiceOverrides((prev) => {
      const next = { ...prev };
      if (!lvl) {
        delete next[srv];
      } else {
        next[srv] = lvl;
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleRetentionChange = (lvl: LogLevel, days: number) => {
    const validDays = Math.max(1, Math.min(3650, days || 1));
    setRetentionDays((prev) => ({
      ...prev,
      [lvl]: validDays,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await onSave({
      enabled,
      minLevel,
      serviceOverrides,
      retentionDays,
    });
    if (success) {
      setHasChanges(false);
    }
  };

  const handleResetLocal = () => {
    if (settings) {
      setEnabled(settings.enabled);
      setMinLevel(settings.minLevel);
      setServiceOverrides(settings.serviceOverrides ?? {});
      setRetentionDays(settings.retentionDays ?? { debug: 3, info: 7, warn: 30, error: 90 });
      setHasChanges(false);
    }
    onReset();
  };

  return (
    <Card
      className={cn(
        'flex flex-col gap-6 rounded-2xl bg-[var(--bg-elevated)] surface-raised-sm p-6 border border-border/40',
        className
      )}
    >
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-[var(--teal)]" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Capture & Retention Settings
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetLocal}
              disabled={saving}
              className="h-8 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="h-8 rounded-xl text-xs bg-[var(--teal)] text-on-accent hover:opacity-90 transition-opacity"
          >
            <Save className={cn('h-3.5 w-3.5 mr-1', saving && 'animate-spin')} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg)] border border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Master Log Capture
            </span>
            <Badge
              variant={enabled ? 'success' : 'destructive'}
              className={cn(
                'rounded text-[11px] font-mono font-medium',
                enabled && 'text-success'
              )}
            >
              {enabled ? 'ENABLED' : 'DISABLED'}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            When OFF, logs are emitted to stdout only and NOT persisted to PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="log-capture-enabled" className="text-xs text-[var(--text-secondary)]">
            {enabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id="log-capture-enabled"
            checked={enabled}
            onCheckedChange={handleEnabledToggle}
            aria-label="Enable log capture"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Global Minimum Capture Level
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            Captures this selected level and all higher severity levels
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LEVELS.map((lvl) => {
            const isSelected = minLevel === lvl;
            const count = counts[lvl] ?? 0;
            return (
              <Button
                key={lvl}
                type="button"
                variant={isSelected ? 'primary' : 'outline'}
                onClick={() => handleLevelChange(lvl)}
                className={cn(
                  'h-auto flex-col p-3 rounded-xl text-center',
                  isSelected
                    ? 'bg-[var(--teal)] text-on-accent'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {lvl}
                </span>
                <span className="text-[11px] mt-1 opacity-80">
                  {count} stored row{count === 1 ? '' : 's'}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Per-Service Capture Overrides
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] -mt-1">
          Override global minimum level for specific services. Blank inherits global min level ({minLevel}).
        </p>

        <div className="divide-y divide-border/20 rounded-xl bg-[var(--bg)] border border-border/40 overflow-hidden">
          {SERVICES.map((srv) => {
            const currentOverride = serviceOverrides[srv] ?? 'inherit';
            return (
              <div key={srv} className="flex items-center justify-between p-3 text-xs">
                <span className="font-mono text-[var(--text-primary)] font-medium">
                  {srv}
                </span>
                <Select
                  value={currentOverride}
                  onValueChange={(value) => {
                    const level = LEVELS.find((option) => option === value);
                    handleServiceOverride(srv, level ?? '');
                  }}
                >
                  <SelectTrigger size="sm" className="w-52 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectItem value="inherit">Default (Inherit: {minLevel})</SelectItem>
                    {LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl.toUpperCase()} only &amp; above
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Retention Policy (Days)
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">Range: 1 to 3650 days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LEVELS.map((lvl) => (
            <div
              key={lvl}
              className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--bg)] border border-border/40"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase font-bold text-[var(--text-primary)]">
                  {lvl}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {counts[lvl] ?? 0} rows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={3650}
                  value={retentionDays[lvl] ?? 30}
                  onChange={(e) =>
                    handleRetentionChange(lvl, parseInt(e.target.value, 10))
                  }
                  className="h-9 rounded-lg px-2.5 py-1 text-xs font-mono"
                />
                <span className="text-xs text-[var(--text-secondary)]">days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/20 text-xs text-[var(--text-secondary)]">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-[var(--teal)]" />
        <span>
          Logs older than the configured retention period per severity level will be automatically cleaned up by the daily sidecar cron scheduler.
        </span>
      </div>
    </Card>
  );
}
