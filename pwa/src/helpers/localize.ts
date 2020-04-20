import { LitElement } from 'lit-element';
import { get, set } from 'idb-keyval';

type Constructor<T> = new (...args: any[]) => T;

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export type LocaleData = typeof import('../assets/locales/it.json');

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

export const localize = <E extends Constructor<LitElement>>(BaseElement: E) =>
  class extends BaseElement {
    constructor(...args: any[]) {
      super(...args);

      if (!currentLocale) {
        this._loadInitialLocale();
      } else {
        this._updateCurrentLocaleData();
      }
    }

    private async _loadInitialLocale() {
      const storedLocale = await get<SupportedLocale>('locale');
      const userLocale = navigator.language.slice(0, 2);

      return this.setLocale(
        storedLocale ||
          (supportedLocales.includes(userLocale as SupportedLocale)
            ? userLocale
            : defaultLocale),
      );
    }

    private async _updateCurrentLocaleData() {
      if (!localesPromises[currentLocale]) {
        localesPromises[currentLocale] = fetch(
          `/locales/${currentLocale}.json`,
        ).then((res) => res.json());
      }

      currentLocaleData = await localesPromises[currentLocale]!;

      await this.requestUpdate();
    }

    public async setLocale(locale: SupportedLocale) {
      currentLocale = locale;

      document.documentElement.lang = locale;
      await Promise.all([
        this._updateCurrentLocaleData(),
        set('locale', locale),
      ]);
    }

    public get locale() {
      return currentLocale;
    }

    public get localeData() {
      return currentLocaleData;
    }
  };
