// Admin service worker.
//
// Deliberately no precache and no fetch handler: this is an authenticated
// dashboard where a stale HTML shell or a cached API response shows one admin's
// data after sign-out. The only job here is push delivery, so there is no
// offline story to get wrong.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let payload;

  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'NaufalRF Admin', body: event.data.text() };
  }

  const title = payload.title || 'NaufalRF Admin';
  const link = typeof payload.link === 'string' ? payload.link : '/notifications';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/maskable-192.png',
      tag: payload.tag || undefined,
      data: { link },
      timestamp: Date.now(),
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification.data?.link || '/notifications';
  const target = new URL(link, self.location.origin);

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Reuse an already-open admin tab so clicking a push does not pile up
      // duplicate windows.
      for (const client of clientList) {
        if (new URL(client.url).origin !== target.origin) {
          continue;
        }

        await client.focus();

        if ('navigate' in client) {
          await client.navigate(target.href);
        }

        return;
      }

      await self.clients.openWindow(target.href);
    })()
  );
});
