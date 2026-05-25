import { get } from './helpers/keyval';
import {
  SupportedLocale,
  supportedLocales,
  defaultLocale,
} from './helpers/localize';

const getPreferredLocale = async () => {
  const pathLocale = window.location.pathname.slice(1, 3) as SupportedLocale;

  if (supportedLocales.includes(pathLocale)) {
    return pathLocale;
  }

  const storedLocale = await get<SupportedLocale>('locale');

  if (supportedLocales.includes(storedLocale)) {
    return storedLocale;
  }

  const userLocale = navigator.language.slice(0, 2) as SupportedLocale;

  if (supportedLocales.includes(userLocale)) {
    return userLocale;
  }

  return defaultLocale;
};

// Start importing the preferred user locale
getPreferredLocale().then((locale) => import(`./locales/${locale}.po`));
// Set the correct theme
get<string>('theme').then(
  (storedTheme) => (document.body.dataset.theme = storedTheme || 'system'),
);
// Load the app shell
import('./containers/shell/shell.component');
