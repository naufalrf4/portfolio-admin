'use client';

import { useState } from 'react';
import { ScrollText, SlidersHorizontal, Table as TableIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useLogs,
  useLogSettings,
  LogsTable,
  LogFiltersComponent,
  LogSettingsPanel,
  ClearLogsDialog,
} from '@/features/logs';

export function LogsPageContent() {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings'>('logs');

  const {
    logs,
    counts,
    loading: logsLoading,
    filters,
    setFilters,
    clearFilters,
    nextCursor,
    hasPrevious,
    loadNext,
    loadPrevious,
    refresh: refreshLogs,
  } = useLogs();

  const {
    settings,
    saving: settingsSaving,
    updateSettings,
    refresh: refreshSettings,
  } = useLogSettings();

  const totalLogsCount =
    counts.debug + counts.info + counts.warn + counts.error;

  return (
    <PageWrapper>
      <PageHeader
        title="Application Logs"
        description="Centralized structured log capture, live browsing, and retention configuration"
        icon={<ScrollText />}
        stats={[
          { label: 'Total Ingested', value: totalLogsCount },
          { label: 'Errors', value: counts.error, variant: counts.error > 0 ? 'warning' : 'default' },
          { label: 'Warnings', value: counts.warn, variant: counts.warn > 0 ? 'warning' : 'default' },
          { label: 'Info / Debug', value: counts.info + counts.debug },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ClearLogsDialog onCleared={refreshLogs} />
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] surface-raised-sm">
              <Button
                variant={activeTab === 'logs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('logs')}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  activeTab === 'logs'
                    ? 'bg-[var(--teal)] text-on-accent'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <TableIcon className="h-3.5 w-3.5 mr-1.5" />
                Logs View
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('settings')}
                className={cn(
                  'h-8 px-3 rounded-lg text-xs font-medium',
                  activeTab === 'settings'
                    ? 'bg-[var(--teal)] text-on-accent'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                Capture Settings
              </Button>
            </div>
          </div>
        }
      />

      {activeTab === 'logs' ? (
        <div className="flex flex-col gap-4">
          <LogFiltersComponent
            filters={filters}
            onChange={setFilters}
            onReset={clearFilters}
          />
          <LogsTable
            logs={logs}
            loading={logsLoading}
            nextCursor={nextCursor}
            hasPrevious={hasPrevious}
            onNext={loadNext}
            onPrevious={loadPrevious}
            onRefresh={refreshLogs}
          />
        </div>
      ) : (
        <LogSettingsPanel
          settings={settings}
          counts={counts}
          saving={settingsSaving}
          onSave={updateSettings}
          onReset={refreshSettings}
        />
      )}
    </PageWrapper>
  );
}
