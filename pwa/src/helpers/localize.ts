import type { LitElement } from 'lit-element';
import { get, set } from './keyval';
import { localizedPages, localizeHref } from './localization';

type Constructor<T> = new (...args: any[]) => T;

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export type LocaleData = typeof import('../locales/it')['default'];

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
          `../locales/${currentLocale}`
        ).then((module) => module.default);
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
