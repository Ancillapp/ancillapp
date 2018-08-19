/* eslint-env serviceworker, es6 */
/* global workbox */

self.addEventListener('push', (e) => {
  const data = e.data.json();
  e.waitUntil(self.registration.showNotification(data.title, data));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') {
    return;
  }
  e.waitUntil(clients.matchAll({
    type: 'window',
  }).then((clientsList) => {
    for (const client of clientsList) {
      if (client.url === '/ancillas/latest') {
        return client.focus();
      }
    }
    return clients.openWindow('/ancillas/latest');
  }));
});

workbox.skipWaiting();
workbox.clientsClaim();
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest);
workbox.routing.registerNavigationRoute('/index.html');
workbox.routing.registerRoute(/scripts\/[0-9]+\.js/, workbox.strategies.staleWhileRevalidate(), 'GET');
