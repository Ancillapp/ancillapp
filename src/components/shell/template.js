import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import * as icons from '../icons';
import { html } from '@dabolus/localized-lit-element';

import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template({ appTitle, page, narrow, _drawerOpened, _subroute, _pages }) {
  return html`
    ${sharedStyles}
    ${styles}
  
    <!-- Header -->
    <app-header condenses reveals effects="waterfall" id="header">
      <app-toolbar class="toolbar-top">
        <button class="menu-btn" title="Menu" on-click="${() => this._updateDrawerState(!_drawerOpened)}">
          ${icons.menuIcon}
        </button>
        <div main-title>${icons.tau} ${appTitle} - ${this.localize(page)}</div>
      </app-toolbar>
    </app-header>
    
    <!-- Drawer content -->
    <app-drawer swipe-open persistent?="${narrow}" opened="${_drawerOpened}"
        on-opened-changed="${(e) => this._updateDrawerState(e.target.opened)}">
      <app-toolbar>Menù</app-toolbar>
      <nav class="drawer-list">
        ${_pages.map((p) => html`
          <a selected?="${page === p}" href="/${p}">
            <div class="icon">${icons[`${p}Icon`]}</div>
            <div class="name">${this.localize(p)}</div>
          </a>
        `)}
        <div class="spacing"></div>
        <a selected?="${page === 'settings'}" href="/settings">
          <div class="icon">${icons.settingsIcon}</div>
          <div class="name">${this.localize('settings')}</div>
        </a>
      </nav>
    </app-drawer>
    
    <!-- Main content -->
    <main role="main" class="main-content">
      <home-page class="page" active?="${page === 'home'}"></home-page>
      <ancillas-page class="page" active?="${page === 'ancillas'}"></ancillas-page>
      <songs-page class="page" active?="${page === 'songs'}" subroute="${_subroute}"></songs-page>
      <my-view3 class="page" active?="${page === 'view3'}"></my-view3>
      <my-view404 class="page" active?="${page === 'view404'}"></my-view404>
    </main>
  `;
}
