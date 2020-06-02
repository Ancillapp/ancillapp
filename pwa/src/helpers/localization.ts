import type { SupportedLocale } from './localize';

export const localizedPages: {
  [key: string]: {
    [key in SupportedLocale]: string;
  };
} = {
  breviary: {
    it: 'breviario',
    en: 'breviary',
    de: 'brevier',
    pt: 'breviario',
  },
  songs: {
    it: 'canti',
    en: 'songs',
    de: 'lieder',
    pt: 'cancoes',
  },
  prayers: {
    it: 'preghiere',
    en: 'prayers',
    de: 'gebete',
    pt: 'oracoes',
  },
  ancillas: {
    it: 'ancilla-domini',
    en: 'ancilla-domini',
    de: 'ancilla-domini',
    pt: 'ancilla-domini',
  },
  'holy-mass': {
    it: 'santa-messa',
    en: 'holy-mass',
    de: 'heilige-messe',
    pt: 'santa-messa',
  },
  login: {
    it: 'accesso',
    en: 'login',
    de: 'anmeldung',
    pt: 'conecte-se',
  },
  settings: {
    it: 'impostazioni',
    en: 'settings',
    de: 'einstellungen',
    pt: 'configuracoes',
  },
  info: {
    it: 'informazioni',
    en: 'info',
    de: 'informationen',
    pt: 'informacoes',
  },
  latest: {
    it: 'ultimo',
    en: 'latest',
    de: 'neueste',
    pt: 'mais-recentes',
  },
};

export const localizeHref = (
  locale: SupportedLocale,
  page = 'home',
  ...subroutes: string[]
) => {
  const localizedPage = localizedPages[page]?.[locale];
  const subroute =
    subroutes.length > 0
      ? `/${subroutes
          .map((subroute) => localizedPages[subroute]?.[locale] || subroute)
          .join('/')}`
      : '';

  return `/${locale}${localizedPage ? `/${localizedPage}${subroute}` : ''}`;
};
