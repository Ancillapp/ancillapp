import { handleRequest } from './database';

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
    case 'database':
      handleRequest(event);
      break;
  }
});
