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
  const savedTheme = storedTheme || 'system';
  // For backwards compatibility
  const themeToApply = storedTheme === 'oled' ? 'dark-hc' : savedTheme;
  const mduiTheme = {
    system: 'auto',
    light: 'light',
    dark: 'dark',
    'light-hc': 'light',
    'dark-hc': 'dark',
    'system-hc': 'auto',
  }[themeToApply];
  document.body.dataset.theme = themeToApply;
  document.documentElement.className = `mdui-theme-${mduiTheme}`;
});

get<number>('textSize').then((storedTextSize) => {
  if (typeof storedTextSize === 'number') {
    const normalizedTextSize = Math.min(
      125,
      Math.max(75, Math.round(storedTextSize / 5) * 5),
    );
    document.documentElement.style.fontSize = `${normalizedTextSize}%`;
  }
});
// Load the app shell
import('./containers/shell/shell.component');
