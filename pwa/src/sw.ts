import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { PrecacheEntry } from 'workbox-precaching/_types';
import { get } from './helpers/keyval';
import type { Localized, SupportedLocale } from './helpers/localize';

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

self.addEventListener('push', async (event) => {
  const lang = (await get<SupportedLocale>('locale')) || 'it';

  const {
    title: { [lang]: title },
    body: { [lang]: body },
    actions,
    ...data
  }: {
    title: Localized<string>;
    body: Localized<string>;
    actions?: {
      action: string;
      title: Localized<string>;
    }[];
    [key: string]: unknown;
  } = event.data?.json();

  // We will have a default icon, badge and vibration, but the server might decide
  // to send different data, so we allow it to override them
  event.waitUntil(
    self.registration.showNotification(title, {
      icon: '/images/icons/android-chrome-512x512.png',
      badge: '/images/icons/badge.png',
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
      body,
      lang,
      ...(actions && {
        actions: actions.map(({ title: { [lang]: title }, ...rest }) => ({
          title,
          ...rest,
        })),
      }),
      ...data,
    }),
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
