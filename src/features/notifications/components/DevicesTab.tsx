'use client';

import type { ReactNode } from 'react';
import { BellOff, BellRing, Laptop, LoaderCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils/date';
import type { PushDevice, PushPermission, PushSupportState } from '../types/notifications.types';

interface DevicesTabProps {
  readonly state: PushSupportState;
  readonly permission: PushPermission;
  readonly devices: readonly PushDevice[];
  readonly loading: boolean;
  readonly busy: boolean;
  readonly subscribe: () => Promise<void>;
  readonly unsubscribe: () => Promise<void>;
  readonly removeDevice: (id: string) => Promise<void>;
}

export function DevicesTab({
  state,
  permission,
  devices,
  loading,
  busy,
  subscribe,
  unsubscribe,
  removeDevice,
}: DevicesTabProps) {
  let stateContent: ReactNode;

  switch (state) {
    case 'unsupported':
      stateContent = <p>Your current browser does not support push notifications.</p>;
      break;
    case 'unconfigured':
      stateContent = <p>Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT on the server to enable push.</p>;
      break;
    case 'blocked':
      stateContent = <p>Notifications are blocked. Re-allow them in this browser&apos;s site settings, then refresh this page.</p>;
      break;
    case 'idle':
      stateContent = (
        <Button size="sm" onClick={() => void subscribe()} disabled={busy} className="bg-[var(--teal)] text-on-accent hover:brightness-110">
          {busy ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <BellRing className="mr-1.5 h-3.5 w-3.5" />}
          Enable on this device
        </Button>
      );
      break;
    case 'subscribed':
      stateContent = (
        <Button variant="outline" size="sm" onClick={() => void unsubscribe()} disabled={busy} className="text-xs">
          {busy ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <BellOff className="mr-1.5 h-3.5 w-3.5" />}
          Disable on this device
        </Button>
      );
      break;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Push devices</h2>
        <p className="text-xs text-[var(--text-secondary)]">Push mirrors every in-app notification and needs no per-event setup.</p>
      </div>

      <section className="shape-container flex flex-col gap-3 bg-[var(--bg-card)] p-4 surface-raised sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shape-inner bg-[var(--teal)]/10 p-2 text-[var(--teal)]">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">This device</p>
            <p className="text-xs text-[var(--text-secondary)]">Permission: {permission}</p>
          </div>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{stateContent}</div>
      </section>

      <section className="shape-container overflow-hidden bg-[var(--bg-card)] surface-raised">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Registered devices ({devices.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2].map((item) => <Skeleton key={item} className="skeleton-shimmer h-16 w-full" />)}
          </div>
        ) : devices.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
            <Laptop className="h-6 w-6 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">No push devices registered.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {devices.map((device) => (
              <article key={device.id} className="flex gap-3 p-4">
                <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{device.label ?? 'Unnamed device'}</p>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{device.userAgent ?? device.endpoint}</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">Last seen {formatDateTime(device.lastSeenAt)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${device.label ?? 'registered device'}`}
                  onClick={() => void removeDevice(device.id)}
                  className="icon-btn h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--error)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
