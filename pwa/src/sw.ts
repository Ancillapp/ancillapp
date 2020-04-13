import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { PrecacheEntry } from 'workbox-precaching/_types';

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

declare global {
  interface Window {
    __WB_MANIFEST: PrecacheEntry[];
    clients: {
      claim(): Promise<void>;
      get(id: string): Promise<WindowClient>;
      matchAll<T extends ClientType = ClientType>(options?: {
        includeUncontrolled?: boolean;
        type?: T;
      }): Promise<Array<T extends 'window' ? WindowClient : Client>>;
      openWindow(url: string): Promise<WindowClient>;
    };
    registration: ServiceWorkerRegistration;
  }
  interface WindowEventMap {
    push: PushEvent;
    notificationclick: NotificationEvent;
  }
  function skipWaiting(): void;
}

const openOrFocus = async (url: string) => {
  const clientsList = await self.clients.matchAll({
    type: 'window',
  });

  for (const client of clientsList) {
    if ((url === '*' && client.url.startsWith('/')) || url === client.url) {
      return client.focus();
    }
  }
  return self.clients.openWindow(url === '*' ? '/' : url);
};

self.addEventListener('push', (event) => {
  const data = event.data?.json();
  // We will have a default icon, badge and vibration, but the server might decide
  // to send different data, so we allow it to override them
  event.waitUntil(
    self.registration.showNotification(
      data.title,
      Object.assign(
        {
          icon: '/assets/images/icons/android-chrome-512x512.png',
          badge: '/assets/images/icons/badge.png',
          vibrate: [
            300,
            300,
            300,
            300,
            300,
            1000,
            600,
            600,
            600,
            600,
            600,
            1000,
            300,
            300,
            300,
            300,
            300,
          ],
        },
        data,
      ),
    ),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  switch (event.action) {
    case 'dismiss':
      break;
    case 'latest-ancilla':
      event.waitUntil(openOrFocus('/ancillas/latest'));
      break;
    default:
      event.waitUntil(openOrFocus('*'));
      break;
  }
});

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});

// workbox.googleAnalytics.initialize();
setCacheNameDetails({
  prefix: 'ancillapp',
});
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));
registerRoute(
  /assets\/fonts/,
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);
