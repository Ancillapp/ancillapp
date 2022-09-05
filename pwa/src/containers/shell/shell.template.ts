import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import {
  homeIcon,
  breviaryIcon,
  songsIcon,
  prayersIcon,
  ancillasIcon,
  holyMassIcon,
  settingsIcon,
  infoIcon,
  menu,
  tau,
  logout,
  user,
} from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-drawer';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '../../components/top-app-bar/top-app-bar.component';

// Asynchronous imports
import('@material/mwc-snackbar');
import('../update-checker/update-checker.component');

const pagesTranslations = {
  home: t`home`,
  breviary: t`breviary`,
  songs: t`songs`,
  prayers: t`prayers`,
  ancillas: t`ancillas`,
  holyMass: t`holyMass`,
  settings: t`settings`,
  info: t`info`,
};

const topNavPages: [string, SVGTemplateResult][] = [
  ['home', homeIcon],
  ['breviary', breviaryIcon],
  ['songs', songsIcon],
  ['prayers', prayersIcon],
  ['ancillas', ancillasIcon],
  ['holy-mass', holyMassIcon],
];
const bottomNavPages: [string, SVGTemplateResult][] = [
  ['settings', settingsIcon],
  ['info', infoIcon],
];

/*
  <breviary-index
    class="page padded"
    ?active="${this._page === 'breviary' && !this._subroute}"
    ?drawer-open="${this._narrow}"
    ?show-menu-button="${!this._narrow}"
    @menutoggle="${() =>
    this._updateDrawerOpenState(!this._drawerOpened)}"
  ></breviary-index>
  <breviary-viewer
    class="page padded"
    ?active="${this._page === 'breviary' && this._subroute}"
    ?drawer-open="${this._narrow}"
    ?show-menu-button="${!this._narrow}"
    query="${this._subroute}"
  ></breviary-viewer>
*/

export default function template(this: Shell) {
  return html`
    <mwc-drawer
      hasHeader
      type="${this._narrow ? 'dismissible' : 'modal'}"
      ?open="${this._narrow || this._drawerOpened}"
    >
      <span slot="title">
        ${this._narrow
          ? html`
              <mwc-icon-button
                @click="${() =>
                  this._updateDrawerShrinkState(!this.drawerShrinked)}"
                label="${this.localize(t`menu`)}"
              >
                ${menu}
              </mwc-icon-button>
            `
          : html`${nothing}`}
        ${tau}
        <span>Ancillapp</span>
      </span>
      <div class="menu">
        <mwc-list activatable class="top-nav">
          ${topNavPages.map(
            ([page, icon]) => html`
              <a class="nav-link" href="${this.localizeHref(page)}">
                <mwc-list-item
                  ?selected="${this._page === page}"
                  ?activated="${this._page === page}"
                  graphic="icon"
                >
                  <div slot="graphic">${icon}</div>
                  ${this.localize(
                    pagesTranslations[
                      page.replace(/-([a-z])/g, (_, letter) =>
                        letter.toUpperCase(),
                      ) as keyof typeof pagesTranslations
                    ],
                  )}
                </mwc-list-item>
                ${page === 'home'
                  ? html`<li divider role="separator"></li>`
                  : nothing}
              </a>
            `,
          )}
        </mwc-list>
        <mwc-list activatable class="bottom-nav">
          <li divider role="separator"></li>
          ${this.user
            ? html`
                <mwc-list-item graphic="icon" @click="${this._logout}">
                  <div slot="graphic">${logout}</div>
                  ${this.localize(t`logout`)}
                </mwc-list-item>
              `
            : html`
                <a class="nav-link" href="${this.localizeHref('login')}">
                  <mwc-list-item
                    ?selected="${this._page === 'login'}"
                    ?activated="${this._page === 'login'}"
                    graphic="icon"
                  >
                    <div slot="graphic">${user}</div>
                    ${this.localize(t`login`)}
                  </mwc-list-item>
                </a>
              `}
          ${bottomNavPages.map(
            ([page, icon]) => html`
              <a class="nav-link" href="${this.localizeHref(page)}">
                <mwc-list-item
                  ?selected="${this._page === page}"
                  ?activated="${this._page === page}"
                  graphic="icon"
                >
                  <div slot="graphic">${icon}</div>
                  ${this.localize(
                    pagesTranslations[
                      page.replace(/-([a-z])/g, (_, letter) =>
                        letter.toUpperCase(),
                      ) as keyof typeof pagesTranslations
                    ],
                  )}
                </mwc-list-item>
              </a>
            `,
          )}
        </mwc-list>
      </div>
      <div slot="appContent">
        <main>
          <home-page
            class="page padded"
            ?active="${this._page === 'home'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></home-page>
          <breviary-placeholder
            class="page padded"
            ?active="${this._page === 'breviary' && !this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></breviary-placeholder>
          <songs-list
            class="page"
            ?active="${this._page === 'songs' && !this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></songs-list>
          <song-viewer
            class="page"
            ?active="${this._page === 'songs' && this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            song="${this._subroute}"
          ></song-viewer>
          <prayers-list
            class="page"
            ?active="${this._page === 'prayers' && !this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></prayers-list>
          <prayer-viewer
            class="page"
            ?active="${this._page === 'prayers' && this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            prayer="${this._subroute}"
          ></prayer-viewer>
          <ancillas-list
            class="page"
            ?active="${this._page === 'ancillas' && !this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></ancillas-list>
          <ancilla-viewer
            class="page"
            ?active="${this._page === 'ancillas' && this._subroute}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            ancilla="${this._subroute}"
          ></ancilla-viewer>
          <holy-mass-page
            class="page"
            ?active="${this._page === 'holy-mass'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></holy-mass-page>
          <login-page
            class="page"
            ?active="${this._page === 'login'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
            @register="${() => (this._verificationEmailSent = true)}"
          ></login-page>
          <settings-page
            class="page"
            ?active="${this._page === 'settings'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
            ?keep-screen-active="${this._wakeLockSentinel}"
            @keepscreenactivechange="${this._handleKeepScreenActiveChange}"
          ></settings-page>
          <info-page
            class="page"
            ?active="${this._page === 'info'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></info-page>
        </main>
      </div>
    </mwc-drawer>

    <mwc-snackbar
      leading
      ?open="${this._verificationEmailSent}"
      labelText="Fatto! Controlla la tua casella di posta per verificare il tuo indirizzo email"
    ></mwc-snackbar>

    <update-checker></update-checker>
  `;
}
