import { LitElement } from 'lit-element';

type Constructor<T> = new (...args: any[]) => T;

interface CustomElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  readonly isConnected: boolean;
}

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
      const userLocale = navigator.language.slice(0, 2);

      if (!currentLocale) {
        currentLocale =
          (localStorage.getItem('locale') as SupportedLocale) ||
          (supportedLocales.includes(userLocale as SupportedLocale)
            ? userLocale
            : defaultLocale);
        this._updateCurrentLocaleData();
      }

      super.connectedCallback();
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
