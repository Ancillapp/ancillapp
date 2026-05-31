import { LitElement, PropertyValues } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';
import { installMediaQueryWatcher } from 'pwa-helpers';
import { localize, SupportedLocale } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { get, set } from '../../helpers/keyval';
import { installRouter } from '../../helpers/router';
import type { SearchContent } from '../search/search-content.component';

import sharedStyles from '../../shared.styles.scss';
import styles from './shell.styles.scss';
import template from './shell.template';

import type { Drawer } from '@material/mwc-drawer';

@customElement('ancillapp-shell')
export class Shell extends localize(LitElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true, attribute: 'drawer-shrinked' })
  public drawerShrinked = false;

  @property({ type: String })
  protected _page = 'home';

  @property({ type: Array })
  protected _subroute: string[] = [];

  @property({ type: Boolean })
  protected _drawerOpened = false;

  @property({ type: Boolean })
  protected _wide = false;

  @state()
  protected _navbarScrollTarget: HTMLElement | null = null;

  @state()
  protected _searchDialogOpened = false;

  @property({ type: Object })
  protected _wakeLockSentinel: WakeLockSentinel | null = null;

  @query('mwc-drawer')
  private _drawer!: Drawer;

  @query('#app-content')
  protected _appContent!: HTMLElement;

  @query('search-content')
  protected _searchContent?: SearchContent;

  @queryAll('.page')
  declare private _pages: { scrollTarget: HTMLElement }[];

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
      (matches) => (this._wide = matches),
    );

    this._setupWakeLockSentinel();
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

    if (changedProperties.has('_page')) {
      this._navbarScrollTarget = null;
    }

    if (changedProperties.has('_wide')) {
      this._updateNavbarOffset(!this._wide);
    }

    if (
      changedProperties.has('_wide') ||
      changedProperties.has('_drawerOpened')
    ) {
      this._updateRailWidth();
    }
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);

    installRouter((location, event) => this._locationChanged(location, event));

    this._appContent.addEventListener('scrolltargetchange', (e: Event) => {
      this._navbarScrollTarget = (e as CustomEvent<HTMLElement>).detail;
    });

    // Initialize nav bar offset (nav bar is visible on mobile by default)
    this._updateNavbarOffset(!this._wide);
    this._updateRailWidth();

    window.addEventListener('resize', () => {
      this._updateNavbarOffset(!this._wide);
      this._updateRailWidth();
    });
  }

  protected _updateRailWidth() {
    let width: string;
    if (!this._wide) {
      width = '0rem';
    } else if (this._drawerOpened) {
      width = '13.75rem';
    } else {
      width = '5rem';
    }
    this.style.setProperty('--ancillapp-rail-width', width);
  }

  protected _updateNavbarOffset(navbarVisible: boolean) {
    this.style.setProperty(
      '--ancillapp-nav-bar-offset',
      navbarVisible ? '5rem' : '0rem',
    );
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

  protected async _locationChanged(location: Location, event?: Event | null) {
    const [, page = 'home', ...subroutes] = location.pathname
      .slice(1)
      .split('/');
    const searchQuery = location.search;
    const locale = await this.getPreferredLocale();

    if (page === 'home') {
      window.history.replaceState({}, '', this.localizeHref() + searchQuery);
    }

    await this.setLocale(locale as SupportedLocale);

    this._loadPage(locale as SupportedLocale, page, subroutes.join('/'));

    // On initial page load, auto-open the search dialog on desktop when
    // ?q= is present in the URL and we're not already on the search page.
    if (
      !event &&
      new URLSearchParams(searchQuery).has('q') &&
      this._wide &&
      this._page !== 'search'
    ) {
      this._searchDialogOpened = true;
    }

    // Close the drawer - in case the *path* change came from a link in the drawer.
    if (!this._wide) {
      this._updateDrawerOpenState(false);
    }
  }

  protected _loadPage(locale: SupportedLocale, page: string, subroute = '') {
    let pageId = Object.entries(localizedPages).find(
      ([, { [locale]: localizedPageId }]) => page === localizedPageId,
    )?.[0];

    if (!pageId) {
      window.history.replaceState(
        {},
        '',
        `/${locale}${window.location.search}`,
      );
      pageId = 'home';
    }

    const subrouteParts = subroute
      .split('/')
      .filter((part) => Boolean(part.trim()));

    switch (pageId) {
      case 'home':
        import('../home/home.component');
        break;
      case 'breviary':
        import('../breviary-placeholder/breviary-placeholder.component');
        // if (subrouteParts.length > 0) {
        //   import('../breviary-viewer/breviary-viewer.component');
        // } else {
        //   import('../breviary-index/breviary-index.component');
        // }
        break;
      case 'songs':
        if (subrouteParts.length > 0) {
          import('../song-viewer/song-viewer.component');
        } else {
          import('../songs-list/songs-list.component');
        }
        break;
      case 'prayers':
        if (subrouteParts.length > 0) {
          import('../prayer-viewer/prayer-viewer.component');
        } else {
          import('../prayers-list/prayers-list.component');
        }
        break;
      case 'magazines':
        if (subrouteParts.length > 1) {
          import('../magazine-viewer/magazine-viewer.component');
        } else if (subrouteParts.length > 0) {
          import('../magazines-list/magazines-list.component');
        } else {
          import('../magazines-index/magazines-index.component');
        }
        break;
      case 'holy-mass':
        import('../liturgy-viewer/liturgy-viewer.component');
        break;
      case 'search':
        import('../search/search.component');
        break;
      case 'settings':
        import('../settings/settings.component');
        break;
      case 'info':
        import('../info/info.component');
        break;
    }

    this._page = pageId;
    this._subroute = subrouteParts;
  }

  protected _updateDrawerOpenState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
    }
  }

  protected _onSearchDialogOpen() {
    this.updateComplete.then(() => this._searchContent?.focusSearchField());
  }

  protected async _updateDrawerShrinkState(shrinked: boolean) {
    if (shrinked !== this.drawerShrinked) {
      this.drawerShrinked = shrinked;
      await set('drawerShrinked', shrinked);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillapp-shell': Shell;
  }
}
