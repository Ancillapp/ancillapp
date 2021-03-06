import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import * as googleAnalytics from 'workbox-google-analytics';
import type { PrecacheEntry } from 'workbox-precaching/_types';

import { set } from '../helpers/keyval';
import { version } from '../../../CHANGELOG.md';

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
    fetch: FetchEvent;
  }
  function skipWaiting(): void;
}

import './notifications';
import './communication';

clientsClaim();

self.addEventListener('install', (event: any) => {
  event.waitUntil(set('appVersion', version));
});

if (process.env.BROWSER_ENV === 'development') {
  console.groupCollapsed('Workbox precache manifest');
  self.__WB_MANIFEST.forEach((entry) => console.info(entry));
  console.groupEnd();
} else {
  setCacheNameDetails({
    prefix: 'ancillapp',
  });
  precacheAndRoute(self.__WB_MANIFEST);
  registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));
  registerRoute(
    /^https:\/\/firebasestorage\.googleapis\.com\/.+$/,
    new CacheFirst({
      cacheName: 'ancillapp-assets',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
    'GET',
  );
}
googleAnalytics.initialize({
  hitFilter: (params) => params.set('ep.offline', 'true'),
});
