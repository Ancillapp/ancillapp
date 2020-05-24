import { setCacheNameDetails, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import * as googleAnalytics from 'workbox-google-analytics';
import type { PrecacheEntry } from 'workbox-precaching/_types';

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
import { initDB } from '../helpers/utils';

clientsClaim();

// TODO: remove this part in a week or two
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    (async () => {
      const db = await initDB();

      const songs = await db.getAll('songs');

      const deprecatedSongs = songs.filter(
        ({ number }) => !number.startsWith('IT') && !number.startsWith('DE'),
      );

      const songsTransaction = db.transaction('songs', 'readwrite');

      const songsObjectStore = songsTransaction.objectStore('songs');

      deprecatedSongs.forEach(({ number }) => songsObjectStore.delete(number));

      await songsTransaction.done;

      const prayers = await db.getAll('prayers');

      const deprecatedPrayers = prayers.filter(
        ({ title }) => typeof title === 'string',
      );

      const prayersTransaction = db.transaction('prayers', 'readwrite');

      const prayersObjectStore = prayersTransaction.objectStore('prayers');

      deprecatedPrayers.forEach(({ slug }) => prayersObjectStore.delete(slug));

      await prayersTransaction.done;
    })(),
  );
});

if (process.env.NODE_ENV === 'production') {
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
} else {
  console.groupCollapsed('Workbox precache manifest');
  self.__WB_MANIFEST.forEach((entry) => console.info(entry));
  console.groupEnd();
}
googleAnalytics.initialize({
  hitFilter: (params) => params.set('ep.offline', 'true'),
});
