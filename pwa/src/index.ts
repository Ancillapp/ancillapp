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
get<string>('theme').then((storedTheme) => {
  const themeToApply = storedTheme || 'system';
  const mduiTheme = {
    system: 'auto',
    light: 'light',
    dark: 'dark',
    oled: 'dark',
  }[themeToApply];
  document.body.dataset.theme = themeToApply;
  document.documentElement.className = `mdui-theme-${mduiTheme}`;
});
// Load the app shell
import('./containers/shell/shell.component');
