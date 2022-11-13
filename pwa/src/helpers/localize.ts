import type { LitElement, PropertyValues } from 'lit';
import { get, set } from './keyval';
import { localizedPages, localizeHref } from './localization';
import { i18n, MessageDescriptor } from '@lingui/core';
import type { MessageOptions } from '@lingui/core/cjs/i18n';
import { it, en, de, pt } from 'make-plural/plurals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export type Localized<T> = { [key in SupportedLocale]: T };

i18n.loadLocaleData({
  it: { plurals: it },
  en: { plurals: en },
  de: { plurals: de },
  pt: { plurals: pt },
});

export const supportedLocales: readonly SupportedLocale[] = [
  'it',
  'en',
  'de',
  'pt',
];
export const defaultLocale: SupportedLocale = 'it';

const localesPromisesMap = new Map<SupportedLocale, Promise<void>>();
const localizedComponents: LitElement[] = [];

export const localize = <E extends Constructor<LitElement>>(BaseElement: E) =>
  class extends BaseElement {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      localizedComponents.push(this);

      this._loadInitialLocale();
    }

    protected shouldUpdate(changedProperties: PropertyValues) {
      return super.shouldUpdate(changedProperties) && !!i18n.locale;
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

    public async setLocale(locale: SupportedLocale) {
      if (locale === i18n.locale) {
        return;
      }

      document.documentElement.lang = locale;
      // Set Firebase localization cookies that allow serving localized files
      // with the overridden language instead of user's default one
      document.cookie = `firebase-country-override=${locale}`;
      document.cookie = `firebase-language-override=${locale}`;

      if (!window.location.pathname.startsWith(`/${locale}`)) {
        const [, , page = 'home', ...subroutes] =
          window.location.pathname.split('/');

        const pageId =
          Object.entries(localizedPages).find(
            ([, { [i18n.locale as SupportedLocale]: localizedPageId }]) =>
              page === localizedPageId,
          )?.[0] || 'home';

        window.history.pushState(
          {},
          '',
          localizeHref(locale, pageId, ...subroutes),
        );
      }

      if (!localesPromisesMap.has(locale)) {
        localesPromisesMap.set(
          locale,
          import(`../locales/${locale}.po`)
            .then(({ default: { messages } }) => messages)
            .then((localeData) => i18n.load(locale, localeData)),
        );
      }

      await localesPromisesMap.get(locale);

      i18n.activate(locale);

      await Promise.all([
        ...localizedComponents.map(async (localizedComponent) => {
          localizedComponent.requestUpdate();
          await localizedComponent.updateComplete;
        }),
        set('locale', locale),
      ]);
    }

    public localize(
      id: string | MessageDescriptor,
      values?: Record<string, unknown>,
      messageOptions?: MessageOptions,
    ): string {
      return typeof id === 'string'
        ? i18n._(id, values, messageOptions)
        : i18n._(id);
    }

    public localizeHref(page?: string, ...subroutes: (string | number)[]) {
      return localizeHref(
        (this.locale || defaultLocale) as SupportedLocale,
        page,
        ...subroutes,
      );
    }

    public get locale() {
      return i18n.locale as SupportedLocale;
    }
  };
