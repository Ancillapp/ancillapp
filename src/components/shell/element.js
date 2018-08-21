import { LocalizedLitElement } from '@dabolus/localized-lit-element';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query';
import { installRouter } from 'pwa-helpers/router';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import template from './template';
import { updateMetadata } from 'pwa-helpers/metadata';

class AncillappShell extends LocalizedLitElement {
  static properties = {
    appTitle: String,
    page: String,
    narrow: Boolean,
    _drawerOpened: Boolean,
    _subroute: String,
    _pages: Array,
  };

  static supportedLanguages = ['it', 'en', 'pt'];

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this._pages = ['home', 'ancillas', 'songs', 'breviary', 'prayers'];
    const userLocale = window.navigator.language.substring(0, 2);
    this.globalLocale = AncillappShell.supportedLanguages.includes(userLocale) ? userLocale : 'it';
    this.loadResourceForLocale(`/assets/locales/shell/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender());
    this._updateDrawerState(
      window.matchMedia('(min-width: 768px)').matches ?
        localStorage.getItem('drawer-opened') === 'true' :
        false,
    );
    installMediaQueryWatcher('(min-width: 768px)', (matches) => this.narrow = matches);
  }

  _render(props) {
    return this::template(props);
  }

  _firstRendered() {
    installRouter((location) => this._locationChanged(location));
    this._root.querySelector('#header').scrollTarget = this;
  }

  _didRender(properties, changeList) {
    if (!changeList || 'page' in changeList) {
      const pageTitle = `${this.appTitle} - ${this.localize(this.page || 'home')}`;
      updateMetadata({
        title: pageTitle,
        description: pageTitle,
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  _locationChanged() {
    let path = window.decodeURIComponent(window.location.pathname);
    if (path === '/') {
      // Redirect to home, replacing the history state.
      // In this way, the user won't be trapped in the home page when trying to go back.
      window.history.replaceState({}, '', '/home');
      path = '/home';
    }
    const [page, subroute] = path.slice(1).split('/');
    this._loadPage(page, subroute);
    // Close the drawer - in case the *path* change came from a link in the drawer.
    if (!this.narrow) {
      this._updateDrawerState(false);
    }
  }

  _updateDrawerState(opened) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
      localStorage.setItem('drawer-opened', opened);
      if (opened) {
        this.setAttribute('drawer-opened', '');
      } else {
        this.removeAttribute('drawer-opened');
      }
    }
  }

  _loadPage(page, subroute) {
    if (!this._pages.includes(page)) {
      page = 'home';
    }
    import(`../${page}/element`);
    this.page = page;
    this._subroute = subroute;
  }
}

window.customElements.define('ancillapp-shell', AncillappShell);
