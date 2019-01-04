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
    _topNavPages: Array,
    _bottomNavPages: Array,
    _showUpdateNotification: Boolean,
    dark: Boolean,
  };

  static supportedLanguages = ['it', 'en', 'pt'];

  constructor() {
    super();
    setPassiveTouchGestures(true);
    const userLocale = localStorage.getItem('language') || window.navigator.language.substring(0, 2);
    this.globalLocale = AncillappShell.supportedLanguages.includes(userLocale) ? userLocale : 'it';
    this.loadResourceForLocale(`locales/shell/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender());
    this.checkUpdates();
    this._toggleDarkTheme(localStorage.getItem('dark') === 'true');
    this._topNavPages = ['home', 'ancillas', 'songs', 'breviary', 'prayers'];
    this._bottomNavPages = ['settings', 'info'];
    this._updateDrawerState(
      window.matchMedia('(min-width: 768px)').matches ?
        localStorage.getItem('drawer-opened') === 'true' :
        false,
    );
    installMediaQueryWatcher('(min-width: 768px)', (matches) => this.narrow = matches);
  }

  async checkUpdates() {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    if (registration.waiting) {
      this.newSw = registration.waiting;
      this._showUpdateNotification = true;
      return;
    }
    if (registration.installing) {
      this.trackInstallation(registration.installing);
      return;
    }
    registration.addEventListener('updatefound', () =>
      this.trackInstallation(registration.installing));
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload());
  }

  trackInstallation(sw) {
    sw.addEventListener('statechange', () => {
      if (sw.state === 'installed') {
        this.newSw = sw;
        this._showUpdateNotification = true;
      }
    });
  }

  update() {
    this._showUpdateNotification = false;
    if (!this.newSw) {
      return;
    }
    this.newSw.postMessage({ action: 'update' });
  }

  _render() {
    return this::template();
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
    if (![...this._topNavPages, ...this._bottomNavPages].includes(page)) {
      page = 'home';
    }
    import(`../${page}/element`);
    this.page = page;
    this._subroute = subroute;
  }

  _toggleDarkTheme(state) {
    this.dark = typeof state === 'undefined' ? !this.dark : state;
    if (this.dark) {
      this.setAttribute('dark', '');
    } else {
      this.removeAttribute('dark');
    }
    document.documentElement.className = document.body.className = this.dark ? 'dark' : '';
    localStorage.setItem('dark', this.dark);
  }
}

window.customElements.define('ancillapp-shell', AncillappShell);
