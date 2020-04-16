import { LitElement } from 'lit-element';
import { get } from 'idb-keyval';

type Constructor<T> = new (...args: any[]) => T;

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export type LocaleData = typeof import('../assets/locales/it.json');

const supportedLocales: readonly SupportedLocale[] = ['it', 'en', 'de', 'pt'];
const defaultLocale: SupportedLocale = 'it';
const localesPromises: { [key in SupportedLocale]?: Promise<LocaleData> } = {};
let currentLocale: SupportedLocale;
let currentLocaleData: LocaleData;

export const localize = <E extends Constructor<LitElement>>(BaseElement: E) =>
  class extends BaseElement {
    connectedCallback() {
      super.connectedCallback();

      if (!currentLocale) {
        this._loadInitialLocale();
      }
    }

    private async _loadInitialLocale() {
      const storedLocale = await get<SupportedLocale>('locale');
      const userLocale = navigator.language.slice(0, 2);

      currentLocale =
        storedLocale ||
        (supportedLocales.includes(userLocale as SupportedLocale)
          ? userLocale
          : defaultLocale);

      return this._updateCurrentLocaleData();
    }

    private async _updateCurrentLocaleData() {
      if (!localesPromises[currentLocale]) {
        localesPromises[currentLocale] = fetch(
          `/assets/locales/${currentLocale}.json`,
        ).then((res) => res.json());
      }

      currentLocaleData = await localesPromises[currentLocale]!;

      await super.requestUpdate();
    }

    public async setLocale(locale: SupportedLocale) {
      currentLocale = locale;

      await this._updateCurrentLocaleData();
    }

    public get locale() {
      return currentLocale;
    }

    public get localeData() {
      return currentLocaleData;
    }
  };
