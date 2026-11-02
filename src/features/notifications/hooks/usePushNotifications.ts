'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type {
  PushDevice,
  PushPermission,
  PushSupportState,
} from '../types/notifications.types';

interface UsePushNotificationsReturn {
  readonly state: PushSupportState;
  readonly permission: PushPermission;
  readonly devices: readonly PushDevice[];
  readonly loading: boolean;
  readonly busy: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  refresh: () => void;
}

// Returns ArrayBuffer, not Uint8Array: applicationServerKey requires a buffer
// backed by ArrayBuffer, and Uint8Array is typed as ArrayBufferLike.
function urlBase64ToApplicationServerKey(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);

  for (let index = 0; index < raw.length; index += 1) {
    view[index] = raw.charCodeAt(index);
  }

  return buffer;
}

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function describeDevice(): string {
  const agent = navigator.userAgent;

  if (/android/i.test(agent)) return 'Android device';
  if (/iphone|ipad|ipod/i.test(agent)) return 'iOS device';
  if (/macintosh/i.test(agent)) return 'Mac';
  if (/windows/i.test(agent)) return 'Windows PC';
  if (/linux/i.test(agent)) return 'Linux desktop';
  return 'This device';
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [state, setState] = useState<PushSupportState>('idle');
  const [permission, setPermission] = useState<PushPermission>('default');
  const [devices, setDevices] = useState<readonly PushDevice[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!isPushSupported()) {
      setState('unsupported');
      setLoading(false);
      return;
    }

    setPermission(Notification.permission as PushPermission);

    try {
      const res = await fetch('/api/v1/admin/notifications/push');
      const json = await res.json();

      if (!json.success) {
        setState('unconfigured');
        return;
      }

      const key = json.data.publicKey as string | null;
      setPublicKey(key);
      setDevices(json.data.subscriptions as readonly PushDevice[]);

      if (!key) {
        setState('unconfigured');
        return;
      }

      if (Notification.permission === 'denied') {
        setState('blocked');
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      const existing = await registration?.pushManager.getSubscription();
      setState(existing ? 'subscribed' : 'idle');
    } catch {
      setState('unconfigured');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const subscribe = useCallback(async () => {
    if (!publicKey) {
      toast.error('Web push is not configured on this server');
      return;
    }

    setBusy(true);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult as PushPermission);

      if (permissionResult !== 'granted') {
        setState(permissionResult === 'denied' ? 'blocked' : 'idle');
        toast.error('Notification permission was not granted');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // An existing subscription minted from a different VAPID key can never be
      // reused, so drop it before subscribing again.
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToApplicationServerKey(publicKey),
      });

      const payload = subscription.toJSON();
      const res = await fetch('/api/v1/admin/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: payload.keys?.p256dh, auth: payload.keys?.auth },
          label: describeDevice(),
        }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message ?? 'Failed to register this device');
      }

      setState('subscribed');
      toast.success('This device will now receive notifications');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable push notifications');
    } finally {
      setBusy(false);
    }
  }, [load, publicKey]);

  const unsubscribe = useCallback(async () => {
    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/v1/admin/notifications/push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setState('idle');
      toast.success('This device will no longer receive notifications');
      await load();
    } catch {
      toast.error('Failed to disable push notifications');
    } finally {
      setBusy(false);
    }
  }, [load]);

  const removeDevice = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/v1/admin/notifications/push/${id}`, { method: 'DELETE' });
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error?.message ?? 'Failed to remove device');
        }

        toast.success('Device removed');
        await load();
      } catch {
        toast.error('Failed to remove device');
      }
    },
    [load]
  );

  return {
    state,
    permission,
    devices,
    loading,
    busy,
    subscribe,
    unsubscribe,
    removeDevice,
    refresh: () => void load(),
  };
}
