import { LitElement, PropertyValues } from 'lit';
import { customElement, property, query, queryAll } from 'lit/decorators.js';
import { installMediaQueryWatcher } from 'pwa-helpers';
import { signOut } from 'firebase/auth';
import { localize, SupportedLocale } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { authorize } from '../../helpers/authorize';
import { get, set } from '../../helpers/keyval';
import { installRouter } from '../../helpers/router';
import { auth } from '../../helpers/firebase';

import sharedStyles from '../../shared.styles';
import styles from './shell.styles';
import template from './shell.template';

import type { Drawer } from '@material/mwc-drawer';

@customElement('ancillapp-shell')
export class Shell extends localize(authorize(LitElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true, attribute: 'drawer-shrinked' })
  public drawerShrinked = false;

  @property({ type: String })
  protected _page = 'home';

  @property({ type: String })
  protected _subroute = '';

  @property({ type: Boolean })
  protected _drawerOpened = false;

  @property({ type: Boolean })
  protected _narrow = false;

  @property({ type: Boolean })
  protected _verificationEmailSent = new URLSearchParams(
    window.location.search,
  ).has('registered');

  @property({ type: Object })
  protected _wakeLockSentinel: WakeLockSentinel | null = null;

  @query('mwc-drawer')
  private _drawer!: Drawer;

  @queryAll('.page')
  private _pages: { scrollTarget: HTMLElement }[] = [];

  constructor() {
    super();
    this._observeForThemeChanges();

    if (window.matchMedia('(min-width: 48rem)').matches) {
      get<boolean>('drawerShrinked').then((drawerOpened) =>
        this._updateDrawerShrinkState(drawerOpened),
      );
    }

    installMediaQueryWatcher(
      '(min-width: 48rem)',
      (matches) => (this._narrow = matches),
    );

    this._setupWakeLockSentinel();
    this._registerServiceWorker();
  }

  private async _registerServiceWorker() {
    // Load and register pre-caching Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () =>
        navigator.serviceWorker
          .register('sw.js', {
            scope: '/',
          })
          .catch(console.warn),
      );
    }
  }

  private async _setupWakeLockSentinel() {
    const keepScreenActive = await get<boolean>('keepScreenActive');

    if (keepScreenActive && document.visibilityState === 'visible') {
      this._wakeLockSentinel = await navigator.wakeLock.request('screen');
    }

    document.addEventListener('visibilitychange', async () => {
      if (this._wakeLockSentinel && document.visibilityState === 'visible') {
        this._wakeLockSentinel = await navigator.wakeLock.request('screen');
      }
    });
  }

  protected async _handleKeepScreenActiveChange({
    detail,
  }: CustomEvent<boolean>) {
    if (detail) {
      await set('keepScreenActive', true);

      this._wakeLockSentinel = await navigator.wakeLock.request('screen');
    } else {
      await set('keepScreenActive', false);

      if (this._wakeLockSentinel) {
        await this._wakeLockSentinel.release();
        this._wakeLockSentinel = null;
      }
    }
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('user')) {
      if (this.user && this._page === 'login') {
        window.history.replaceState({}, '', '/');
        this._locationChanged(window.location);
      }
    }
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    installRouter((location) => this._locationChanged(location));

    // TODO: discover why we need this instead of just using
    // @MDCDrawer:closed="${() => (this._drawerOpened = false)}"
    // in the template
    this._drawer.addEventListener(
      'MDCDrawer:closed',
      () => (this._drawerOpened = false),
    );

    const slotChangeListener = () => {
      const drawerContent =
        this._drawer.shadowRoot!.querySelector<HTMLDivElement>(
          '.mdc-drawer-app-content',
        );

      if (!drawerContent) {
        return;
      }

      this._drawer.shadowRoot!.removeEventListener(
        'slotchange',
        slotChangeListener,
      );

      this._pages.forEach((page) => (page.scrollTarget = drawerContent));
    };

    this._drawer.shadowRoot!.addEventListener('slotchange', slotChangeListener);
  }

  protected _observeForThemeChanges() {
    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )!;

    const themeColorUpdateCallback = () =>
      (themeColor.content = getComputedStyle(document.body).getPropertyValue(
        '--ancillapp-top-app-bar-background',
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
    const [, page = 'home', ...subroutes] = location.pathname
      .slice(1)
      .split('/');
    const locale = await this.getPreferredLocale();

    if (page === 'home') {
      window.history.replaceState({}, '', this.localizeHref());
    }

    await this.setLocale(locale as SupportedLocale);

    this._loadPage(locale as SupportedLocale, page, subroutes.join('/'));

    // Close the drawer - in case the *path* change came from a link in the drawer.
    if (!this._narrow) {
      this._updateDrawerOpenState(false);
    }
  }

  protected _loadPage(locale: SupportedLocale, page: string, subroute = '') {
    let pageId = Object.entries(localizedPages).find(
      ([, { [locale]: localizedPageId }]) => page === localizedPageId,
    )?.[0];

    if (!pageId || (pageId === 'login' && this.user)) {
      window.history.replaceState({}, '', `/${locale}`);
      pageId = 'home';
    }

    switch (pageId) {
      case 'home':
        import('../home/home.component');
        break;
      case 'breviary':
        import('../breviary-placeholder/breviary-placeholder.component');
        // if (subroute) {
        //   import('../breviary-viewer/breviary-viewer.component');
        // } else {
        //   import('../breviary-index/breviary-index.component');
        // }
        break;
      case 'songs':
        if (subroute) {
          import('../song-viewer/song-viewer.component');
        } else {
          import('../songs-list/songs-list.component');
        }
        break;
      case 'prayers':
        if (subroute) {
          import('../prayer-viewer/prayer-viewer.component');
        } else {
          import('../prayers-list/prayers-list.component');
        }
        break;
      case 'ancillas':
        if (subroute) {
          import('../ancilla-viewer/ancilla-viewer.component');
        } else {
          import('../ancillas-list/ancillas-list.component');
        }
        break;
      case 'holy-mass':
        import('../holy-mass/holy-mass.component');
        break;
      case 'login':
        import('../login/login.component');
        break;
      case 'settings':
        import('../settings/settings.component');
        break;
      case 'info':
        import('../info/info.component');
        break;
    }

    this._page = pageId;
    this._subroute = subroute;
  }

  protected _updateDrawerOpenState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
    }
  }

  protected async _updateDrawerShrinkState(shrinked: boolean) {
    if (shrinked !== this.drawerShrinked) {
      this.drawerShrinked = shrinked;
      await set('drawerShrinked', shrinked);
    }
  }

  protected async _logout() {
    await signOut(auth);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillapp-shell': Shell;
  }
}
