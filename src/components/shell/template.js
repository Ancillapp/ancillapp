import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '../snack-bar/element';
import '@material/mwc-button';
import * as icons from '../icons';
import { html } from '@dabolus/localized-lit-element';

import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template() {
  return html`
    ${sharedStyles}
    ${styles}
  
    <!-- Header -->
    <app-header condenses reveals effects="waterfall" id="header">
      <app-toolbar class="toolbar-top">
        <button class="menu-btn" title="${this.localize('menu')}"
          on-click="${() => this._updateDrawerState(!this._drawerOpened)}">
          ${icons.menuIcon}
        </button>
        <div main-title>${icons.tau} ${this.page === 'home' ? this.appTitle : this.localize(this.page)}</div>
      </app-toolbar>
    </app-header>
    
    <!-- Drawer content -->
    <app-drawer swipe-open persistent?="${this.narrow}" opened="${this._drawerOpened}"
        on-opened-changed="${(e) => this._updateDrawerState(e.target.opened)}">
      <app-toolbar>${this.localize('menu')}</app-toolbar>
      <nav class="drawer-list">
        <div class="top-nav">
          ${this._topNavPages.map((p) => html`
            <a selected?="${this.page === p}" href="/${p}">
              <div class="icon">${icons[`${p}Icon`]}</div>
              <div class="name">${this.localize(p)}</div>
            </a>
            ${p === 'home' ? html`<hr>` : ''}
          `)}
        </div>
        <div class="bottom-nav">
          <hr>
          ${this._bottomNavPages.map((p) => html`
            <a selected?="${this.page === p}" href="/${p}">
              <div class="icon">${icons[`${p}Icon`]}</div>
              <div class="name">${this.localize(p)}</div>
            </a>
          `)}
        </div>
      </nav>
    </app-drawer>
    
    <!-- Main content -->
    <main role="main" class="main-content">
      <home-page class="page" active?="${this.page === 'home'}"></home-page>
      <ancillas-page class="page" active?="${this.page === 'ancillas'}"></ancillas-page>
      <songs-page class="page" active?="${this.page === 'songs'}" subroute="${this._subroute}"></songs-page>
      <breviary-page class="page" active?="${this.page === 'breviary'}"></breviary-page>
      <prayers-page class="page" active?="${this.page === 'prayers'}"></prayers-page>
      <settings-page
        class="page"
        active?="${this.page === 'settings'}"
        darkThemeEnabled?="${this.dark}"
        on-toggle-dark-theme="${() => this._toggleDarkTheme()}"></settings-page>
      <info-page class="page" active?="${this.page === 'info'}"></info-page>
    </main>
    
    <snack-bar active?="${this._showUpdateNotification}">
      <div slot="text">${this.localize('update-available')}</div>
      <div slot="actions">      
        <mwc-button on-click="${() => this._showUpdateNotification = false}"
          label="${this.localize('update-ignore')}"></mwc-button>
        <mwc-button on-click="${() => this.update()}"
          label="${this.localize('update-now')}"></mwc-button>
      </div>
    </snack-bar>
  `;
}
