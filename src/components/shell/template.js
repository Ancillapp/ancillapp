import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import { ancillaIcon, breviaryIcon, homeIcon, menuIcon, prayersIcon, songsIcon, tau } from '../icons';
import { html } from '@polymer/lit-element';

import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template({ appTitle, page, _drawerOpened, _offline, _subroute, _pageTitle }) {
  return html`
    ${sharedStyles}
    ${styles}
  
    <!-- Header -->
    <app-header condenses reveals effects="waterfall" id="header">
      <app-toolbar class="toolbar-top">
        <button class="menu-btn" title="Menu" on-click="${() => this._updateDrawerState(true)}">${menuIcon}</button>
        <div main-title>${tau} ${appTitle} - ${_pageTitle}</div>
      </app-toolbar>
    </app-header>
    
    <!-- Drawer content -->
    <app-drawer swipe-open opened="${_drawerOpened}"
        on-opened-changed="${(e) => this._updateDrawerState(e.target.opened)}">
      <app-toolbar>Menù</app-toolbar>
      <nav class="drawer-list">
        <a selected?="${page === 'home'}" href="/home">
          <div class="icon">${homeIcon}</div>
          <div class="name">Home</div>
        </a>
        <hr>
        <a selected?="${page === 'ancillas'}" href="/ancillas">
          <div class="icon">${ancillaIcon}</div>
          <div class="name">Ancilla Domini</div>
        </a>
        <a selected?="${page === 'songs'}" href="/songs">
          <div class="icon">${songsIcon}</div>
          <div class="name">Canti</div>
        </a>
        <a selected?="${page === 'breviary'}" href="/breviary">
          <div class="icon">${breviaryIcon}</div>
          <div class="name">Breviario</div>
        </a>
        <a selected?="${page === 'prayers'}" href="/prayers">
          <div class="icon">${prayersIcon}</div>
          <div class="name">Preghiere</div>
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
