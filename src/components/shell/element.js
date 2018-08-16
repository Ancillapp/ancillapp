import { LitElement } from '@polymer/lit-element';
import { installRouter } from 'pwa-helpers/router';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import template from './template';
import { updateMetadata } from 'pwa-helpers/metadata';


class AncillappShell extends LitElement {
  static properties = {
    appTitle: String,
    page: String,
    _drawerOpened: Boolean,
    _narrow: Boolean,
    _subroute: String,
  };

  static pages = {
    'home': 'Home',
    'ancilla': 'Ancilla Domini',
    'songs': 'Canti',
  };

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this._drawerOpened = false;
  }

  _render(props) {
    return this::template({
      ...props,
      _pageTitle: AncillappShell.pages[props.page] || 'Home',
    });
  }

  _firstRendered() {
    installRouter((location) => this._locationChanged(location));
  }

  _didRender(properties, changeList) {
    if ('page' in changeList) {
      const pageTitle = `${properties.appTitle} - ${AncillappShell.pages[changeList.page]}`;
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
    this._updateDrawerState(false);
  }

  _updateDrawerState(opened) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
    }
  }

  _loadPage(page, subroute) {
    if (!Object.keys(AncillappShell.pages).includes(page)) {
      page = 'home';
    }
    import(`../${page}/element`);
    this.page = page;
    this._subroute = subroute;
  }
}

window.customElements.define('ancillapp-shell', AncillappShell);
