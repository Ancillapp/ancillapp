import { get } from './keyval';
import type { Localized, SupportedLocale } from '../helpers/localize';
import { localizeHref } from '../helpers/localization';

const openOrFocus = async (urlOrPage?: string, ...subroutes: string[]) => {
  let url = urlOrPage;

  if (url && !url.startsWith('/') && !url.startsWith('http')) {
    const storedLocale = await get<SupportedLocale>('locale');
    const locale = storedLocale || 'it';

    url = localizeHref(locale, url, ...subroutes);
  }

  const clientsList = await self.clients.matchAll({
    type: 'window',
  });

  for (const client of clientsList) {
    if ((!url && client.url.startsWith('/')) || url === client.url) {
      return client.focus();
    }
  }

  return self.clients.openWindow(url || '/');
};

self.addEventListener('push', (event) => {
  // We will have a default icon, badge and vibration, but the server might decide
  // to send different data, so we allow it to override them
  event.waitUntil(
    get<SupportedLocale>('locale').then((storedLocale) => {
      const lang = storedLocale || 'it';

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
      } = event.data?.json();

      return self.registration.showNotification(title, {
        icon: '/images/icons/android-chrome-512x512.png',
        badge: '/images/icons/badge.png',
        vibrate: [
          300, 300, 300, 300, 300, 1000, 600, 600, 600, 600, 600, 1000, 300,
          300, 300, 300, 300,
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
      });
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  switch (event.action) {
    case 'dismiss':
      break;
    case 'latest-ancilla':
      event.waitUntil(openOrFocus('ancilla-domini', 'latest'));
      break;
    default:
      event.waitUntil(openOrFocus());
      break;
  }
});
