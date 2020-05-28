import {
  customElement,
  LitElement,
  property,
  PropertyValues,
} from 'lit-element';
import {
  installMediaQueryWatcher,
  installRouter,
  updateMetadata,
} from 'pwa-helpers';
import { localize, SupportedLocale } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { authorize } from '../../helpers/authorize';
import { get, set } from '../../helpers/keyval';

import sharedStyles from '../shared.styles';
import styles from './shell.styles';
import template from './shell.template';

import type { TopAppBar } from '../top-app-bar/top-app-bar.component';

import firebase from 'firebase/app';

const auth = firebase.auth();
const analytics = firebase.analytics();

@customElement('ancillapp-shell')
export class Shell extends localize(authorize(LitElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _page = 'home';

  @property({ type: String })
  protected _subroute: string = '';

  @property({ type: Boolean })
  protected _drawerOpened = false;

  @property({ type: Boolean })
  protected _narrow = false;

  @property({ type: Boolean })
  protected _updateNotificationShown = false;

  @property({ type: Boolean })
  protected _verificationEmailSent = new URLSearchParams(
    window.location.search,
  ).has('registered');

  protected readonly _topNavPages = [
    'home',
    'breviary',
    'songs',
    'prayers',
    'ancillas',
    'holy-mass',
  ];
  protected readonly _bottomNavPages = ['settings', 'info'];

  private _newSw?: ServiceWorker = undefined;

  constructor() {
    super();
    this._checkForUpdates();
    this._observeForThemeChanges();

    if (window.matchMedia('(min-width: 48rem)').matches) {
      get<boolean>('drawerOpened').then((drawerOpened) =>
        this._updateDrawerState(drawerOpened),
      );
    }

    installMediaQueryWatcher(
      '(min-width: 48rem)',
      (matches) => (this._narrow = matches),
    );
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.size < 1 || changedProperties.has('_page')) {
      const pageTitle = `Ancillapp - ${
        (this.localeData as { [key: string]: string })?.[
          this._page.replace(/-([a-z])/g, (_, letter) =>
            letter.toUpperCase(),
          ) || 'home'
        ] ||
        `${this._page?.[0]?.toUpperCase() || ''}${
          this._page
            ?.slice(1)
            .replace(/-([a-z])/g, (_, letter) => ` ${letter.toUpperCase()}`) ||
          ''
        }` ||
        'Home'
      }`;

      updateMetadata({
        title: pageTitle,
        description: pageTitle,
        // This object also takes an image property, that points to an img src.
      });
    }

    if (changedProperties.has('user')) {
      if (this.user && this._page === 'login') {
        window.history.replaceState({}, '', '/');
        this._locationChanged(window.location);
      }
    }
  }

  protected firstUpdated() {
    installRouter((location) => this._locationChanged(location));

    const drawer = this.shadowRoot!.querySelector('mwc-drawer')!;
    const topAppBar = this.shadowRoot!.querySelector<TopAppBar>('top-app-bar')!;

    // TODO: discover why we need this instead of just using
    // @MDCDrawer:closed="${() => (this._drawerOpened = false)}"
    // in the template
    drawer.addEventListener(
      'MDCDrawer:closed',
      () => (this._drawerOpened = false),
    );

    const slotChangeListener = () => {
      const drawerContent = drawer.shadowRoot!.querySelector<HTMLDivElement>(
        '.mdc-drawer-app-content',
      );

      if (!drawerContent) {
        return;
      }

      drawer.shadowRoot!.removeEventListener('slotchange', slotChangeListener);

      topAppBar.scrollTarget = drawerContent;
    };

    drawer.shadowRoot!.addEventListener('slotchange', slotChangeListener);
  }

  protected _observeForThemeChanges() {
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )!;

    const themeColorUpdateCallback = () =>
      (themeColor.content = getComputedStyle(document.body).getPropertyValue(
        '--ancillapp-top-app-bar-color',
      ));

    const observer = new MutationObserver((mutations) =>
      mutations.forEach(({ attributeName }) => {
        if (attributeName === 'data-theme') {
          themeColorUpdateCallback();
        }
      }),
    );

    observer.observe(document.body, { attributes: true });

    installMediaQueryWatcher(
      '(prefers-color-scheme: dark)',
      themeColorUpdateCallback,
    );
  }

  protected async _locationChanged(location: Location) {
    let [, page = 'home', ...subroutes] = location.pathname.slice(1).split('/');
    const locale = await this.getPreferredLocale();

    if (page === 'home') {
      window.history.replaceState({}, '', this.localizeHref());
    }

    await this.setLocale(locale as SupportedLocale);

    this._loadPage(locale as SupportedLocale, page, subroutes.join('/'));

    const pageTitle = `Ancillapp - ${
      (this.localeData as { [key: string]: string })?.[
        this._page.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) ||
          'home'
      ] ||
      `${this._page?.[0]?.toUpperCase() || ''}${
        this._page
          ?.slice(1)
          .replace(/-([a-z])/g, (_, letter) => ` ${letter.toUpperCase()}`) || ''
      }` ||
      'Home'
    }`;

    analytics.logEvent('page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname,
      offline: false,
    });

    // Close the drawer - in case the *path* change came from a link in the drawer.
    if (!this._narrow) {
      this._updateDrawerState(false);
    }
  }

  protected _loadPage(locale: SupportedLocale, page: string, subroute = '') {
    let pageId = Object.entries(localizedPages).find(
      ([_, { [locale]: localizedPageId }]) => page === localizedPageId,
    )?.[0];

    if (!pageId || (pageId === 'login' && this.user)) {
      window.history.replaceState({}, '', `/${locale}`);
      pageId = 'home';
    }

    import(`../pages/${pageId}/${pageId}.component`);
    this._page = pageId;
    this._subroute = subroute;
  }

  protected async _updateDrawerState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
      await set('drawerOpened', opened);
    }
  }

  protected async _checkForUpdates() {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    if (registration.waiting) {
      this._newSw = registration.waiting;
      this._updateNotificationShown = true;
      return;
    }
    if (registration.installing) {
      this._trackInstallation(registration.installing);
      return;
    }
    registration.addEventListener('updatefound', () =>
      this._trackInstallation(registration.installing!),
    );
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload(),
    );
  }

  protected _trackInstallation(sw: ServiceWorker) {
    sw.addEventListener('statechange', () => {
      if (sw.state === 'installed') {
        this._newSw = sw;
        this._updateNotificationShown = true;
      }
    });
  }

  protected _cancelUpdate() {
    this._updateNotificationShown = false;
    analytics.logEvent('cancel_update', {
      offline: false,
    });
  }

  protected _updateApp() {
    this._updateNotificationShown = false;
    if (!this._newSw) {
      return;
    }
    this._newSw.postMessage({ action: 'update' });
    analytics.logEvent('perform_update', {
      offline: false,
    });
  }

  protected async _logout() {
    await auth.signOut();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillapp-shell': Shell;
  }
}
