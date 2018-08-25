/* eslint-env serviceworker, es6 */
/* global workbox */

const openOrFocus = (url) =>
  clients.matchAll({
    type: 'window',
  }).then((clientsList) => {
    for (const client of clientsList) {
      if ((url === '*' && client.url.startsWith('/')) || url === client.url) {
        return client.focus();
      }
    }
    return clients.openWindow(url === '*' ? '/' : url);
  });

self.addEventListener('push', (e) => {
  const data = e.data.json();
  // We will have a default icon, badge and vibration, but the server might decide
  // to send different data, so we allow it to override them
  e.waitUntil(self.registration.showNotification(data.title, Object.assign({
    icon: '/assets/images/icons/android-chrome-512x512.png',
    badge: '/assets/images/icons/badge.png',
    vibrate: [300, 300, 300, 300, 300, 1000, 600, 600, 600, 600, 600, 1000, 300, 300, 300, 300, 300],
  }, data)));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  switch (e.action) {
    case 'dismiss':
      break;
    case 'latest-ancilla':
      e.waitUntil(openOrFocus('/ancillas/latest'));
      break;
    default:
      e.waitUntil(openOrFocus('*'));
      break;
  }
});

self.addEventListener('message', (e) => {
  switch (e.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});

// workbox.googleAnalytics.initialize();
// workbox.skipWaiting();
workbox.clientsClaim();
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest);
workbox.routing.registerNavigationRoute('/index.html');
workbox.routing.registerRoute(
  /assets\/fonts/,
  workbox.strategies.cacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET',
);
workbox.routing.registerRoute(
  /assets\/locales/,
  workbox.strategies.staleWhileRevalidate(),
  'GET',
);
