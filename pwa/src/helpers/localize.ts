import type { LitElement } from 'lit-element';
import { get, set } from './keyval';

type Constructor<T> = new (...args: any[]) => T;

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export type LocaleData = typeof import('../locales/it.json');

export type Localized<T> = { [key in SupportedLocale]: T };

export const supportedLocales: readonly SupportedLocale[] = [
  'it',
  'en',
  'de',
  'pt',
];
export const defaultLocale: SupportedLocale = 'it';
const localesPromises: { [key in SupportedLocale]?: Promise<LocaleData> } = {};
let currentLocale: SupportedLocale;
let currentLocaleData: LocaleData;
const localizedComponents: any[] = [];

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
};

export const localizeHref = (
  locale: SupportedLocale,
  page?: string,
  ...subroutes: string[]
) => {
  const localizedPage = localizedPages[page || 'home']?.[locale];
  const subroute = subroutes.length > 0 ? `/${subroutes.join('/')}` : '';

  return `/${locale}${localizedPage ? `/${localizedPage}${subroute}` : ''}`;
};

export const localize = <E extends Constructor<LitElement>>(BaseElement: E) =>
  class extends BaseElement {
    constructor(...args: any[]) {
      super(...args);

      localizedComponents.push(this);

      if (!currentLocale) {
        this._loadInitialLocale();
      } else {
        this.updateCurrentLocaleData();
      }
    }

    shouldUpdate() {
      return !!this.localeData;
    }

    public async getPreferredLocale() {
      const pathLocale = window.location.pathname.slice(
        1,
        3,
      ) as SupportedLocale;

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
    }

    private async _loadInitialLocale() {
      const locale = await this.getPreferredLocale();

      await this.setLocale(locale);
    }

    public async updateCurrentLocaleData() {
      if (!localesPromises[currentLocale]) {
        localesPromises[currentLocale] = import(
          `../locales/${currentLocale}.json`
        );
      }

      currentLocaleData = await localesPromises[currentLocale]!;

      await this.requestUpdate();
    }

    public async setLocale(locale: SupportedLocale) {
      if (locale === currentLocale) {
        return;
      }

      document.documentElement.lang = locale;

      if (!window.location.pathname.startsWith(`/${locale}`)) {
        const [
          ,
          ,
          page = 'home',
          ...subroutes
        ] = window.location.pathname.split('/');

        const pageId =
          Object.entries(localizedPages).find(
            ([_, { [currentLocale]: localizedPageId }]) =>
              page === localizedPageId,
          )?.[0] || 'home';

        window.history.pushState(
          {},
          '',
          localizeHref(locale, pageId, ...subroutes),
        );
      }

      currentLocale = locale;

      await Promise.all([
        ...localizedComponents.map((localizedComponent) =>
          localizedComponent.updateCurrentLocaleData(),
        ),
        set('locale', locale),
      ]);
    }

    public localizeHref(page?: string, ...subroutes: string[]) {
      return localizeHref(this.locale || defaultLocale, page, ...subroutes);
    }

    public get locale() {
      return currentLocale;
    }

    public get localeData() {
      return currentLocaleData;
    }
  };
