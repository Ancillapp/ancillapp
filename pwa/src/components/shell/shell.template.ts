import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import * as icons from '../icons';

import '@material/mwc-drawer';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-snackbar';
import '../top-app-bar/top-app-bar.component';
import '../snackbar/snackbar.component';

export default function template(this: Shell) {
  return html`
    <mwc-drawer
      hasHeader
      type="${this._narrow ? 'dismissible' : 'modal'}"
      ?open="${this._drawerOpened}"
    >
      <span slot="title">${this.localeData?.menu}</span>
      <div class="menu">
        <mwc-list activatable class="top-nav">
          ${this._topNavPages.map(
            (page) => html`
              <a class="nav-link" href="${this.localizeHref(page)}">
                <mwc-list-item
                  ?selected="${this._page === page}"
                  ?activated="${this._page === page}"
                  graphic="icon"
                >
                  <div slot="graphic">
                    ${(icons as { [key: string]: SVGTemplateResult })[
                      `${page.replace(/-([a-z])/g, (_, letter) =>
                        letter.toUpperCase(),
                      )}Icon`
                    ]}
                  </div>
                  <slot
                    >${(this.localeData as { [key: string]: string })?.[
                      page.replace(/-([a-z])/g, (_, letter) =>
                        letter.toUpperCase(),
                      )
                    ]}</slot
                  >
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
                  <div slot="graphic">
                    ${icons.logout}
                  </div>
                  <slot>${this.localeData?.logout}</slot>
                </mwc-list-item>
              `
            : html`
                <a class="nav-link" href="${this.localizeHref('login')}">
                  <mwc-list-item
                    ?selected="${this._page === 'login'}"
                    ?activated="${this._page === 'login'}"
                    graphic="icon"
                  >
                    <div slot="graphic">
                      ${icons.user}
                    </div>
                    <slot>${this.localeData?.login}</slot>
                  </mwc-list-item>
                </a>
              `}
          ${this._bottomNavPages.map(
            (page) => html`
              <a class="nav-link" href="${this.localizeHref(page)}">
                <mwc-list-item
                  ?selected="${this._page === page}"
                  ?activated="${this._page === page}"
                  graphic="icon"
                >
                  <div slot="graphic">
                    ${(icons as { [key: string]: SVGTemplateResult })[
                      `${page}Icon`
                    ]}
                  </div>
                  <slot
                    >${(this.localeData as { [key: string]: string })?.[
                      page
                    ]}</slot
                  >
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
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></home-page>
          <breviary-index
            class="page padded"
            ?active="${this._page === 'breviary' && !this._subroute}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></breviary-index>
          <breviary-viewer
            class="page padded"
            ?active="${this._page === 'breviary' && this._subroute}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            query="${this._subroute}"
          ></breviary-viewer>
          <songs-page
            class="page"
            ?active="${this._page === 'songs'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
            subroute="${this._subroute}"
          ></songs-page>
          <prayers-page
            class="page"
            ?active="${this._page === 'prayers'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
            subroute="${this._subroute}"
          ></prayers-page>
          <ancillas-page
            class="page"
            ?active="${this._page === 'ancillas'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
            subroute="${this._subroute}"
          ></ancillas-page>
          <holy-mass-page
            class="page padded"
            ?active="${this._page === 'holy-mass'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></holy-mass-page>
          <login-page
            class="page padded"
            ?active="${this._page === 'login'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
            @register="${() => (this._verificationEmailSent = true)}"
          ></login-page>
          <settings-page
            class="page padded"
            ?active="${this._page === 'settings'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></settings-page>
          <info-page
            class="page padded"
            ?active="${this._page === 'info'}"
            ?drawer-open="${this._narrow && this._drawerOpened}"
            @menutoggle="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></info-page>
        </main>
      </div>
    </mwc-drawer>

    <snack-bar ?active="${this._updateNotificationShown}">
      <slot>${this.localeData?.updateAvailable}</slot>
      <mwc-button
        slot="actions"
        @click="${this._cancelUpdate}"
        label="${this.localeData?.ignore}"
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${this._updateApp}"
        label="${this.localeData?.updateNow}"
      ></mwc-button>
    </snack-bar>

    <mwc-snackbar
      leading
      ?open="${this._verificationEmailSent}"
      labelText="Fatto! Controlla la tua casella di posta per verificare il tuo indirizzo email"
    ></mwc-snackbar>
  `;
}
