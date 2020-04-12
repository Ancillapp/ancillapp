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
import { localize } from '../../helpers/localize';

import styles from './shell.styles';
import template from './shell.template';

@customElement('ancillapp-shell')
export class Shell extends localize(LitElement) {
  public static styles = styles;

  protected render = template;

  @property({ type: String, attribute: true })
  public theme = 'system';

  @property({ type: String })
  protected _page = 'home';

  @property({ type: String })
  protected _subroute: string;

  @property({ type: Boolean })
  protected _drawerOpened = false;

  @property({ type: Boolean })
  protected _narrow = false;

  protected readonly _topNavPages = [
    'home',
    'ancillas',
    'songs',
    'breviary',
    'prayers',
  ];
  protected readonly _bottomNavPages = ['settings', 'info'];

  constructor() {
    super();
    this._updateDrawerState(
      window.matchMedia('(min-width: 768px)').matches
        ? localStorage.getItem('drawerOpened') === 'true'
        : false,
    );
    installMediaQueryWatcher(
      '(min-width: 768px)',
      (matches) => (this._narrow = matches),
    );
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('_page')) {
      const pageTitle = `Ancillapp - ${
        (this.localeData as { [key: string]: string })?.[this._page || 'home']
      }`;

      updateMetadata({
        title: pageTitle,
        description: pageTitle,
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  protected firstUpdated() {
    installRouter((location) => this._locationChanged(location));
  }

  protected _locationChanged(location: Location) {
    let path = window.decodeURIComponent(location.pathname);
    if (path === '/') {
      // Redirect to home, replacing the history state.
      // In this way, the user won't be trapped in the home page when trying to go back.
      window.history.replaceState({}, '', '/home');
      path = '/home';
    }
    const [page, subroute] = path.slice(1).split('/');
    this._loadPage(page, subroute);
    // Close the drawer - in case the *path* change came from a link in the drawer.
    if (!this._narrow) {
      this._updateDrawerState(false);
    }
  }

  protected _loadPage(page: string, subroute: string) {
    if (![...this._topNavPages, ...this._bottomNavPages].includes(page)) {
      page = 'home';
    }
    import(`../${page}/${page}.component`);
    this._page = page;
    this._subroute = subroute;
  }

  protected _updateDrawerState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
      localStorage.setItem('drawerOpened', `${opened}`);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gad-shell': Shell;
  }
}
