import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import * as icons from '../icons';

import '@material/mwc-top-app-bar';
import '@material/mwc-drawer';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-snackbar';
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
              <a class="nav-link" href="/${page}">
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
                <a class="nav-link" href="/login">
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
              <a class="nav-link" href="/${page}">
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
        <mwc-top-app-bar>
          ${this._subroute
            ? html`
                <a href="/${this._page}" slot="navigationIcon">
                  <mwc-icon-button>${icons.arrowBack}</mwc-icon-button>
                </a>
              `
            : html`
                <mwc-icon-button
                  slot="navigationIcon"
                  @click="${() => this._updateDrawerState(!this._drawerOpened)}"
                >
                  ${icons.menu}
                </mwc-icon-button>
              `}
          <div slot="title">
            ${icons.tau} ${this._page === 'home'
              ? 'Ancillapp'
              : (this.localeData as { [key: string]: string })?.[
                  this._page.replace(/-([a-z])/g, (_, letter) =>
                    letter.toUpperCase(),
                  )
                ]}
          </div>
        </mwc-top-app-bar>
        <main>
          <home-page
            class="page padded"
            ?active="${this._page === 'home'}"
          ></home-page>
          <breviary-page
            class="page padded"
            ?active="${this._page === 'breviary'}"
            subroute="${this._subroute}"
          ></breviary-page>
          <songs-page
            class="page"
            ?active="${this._page === 'songs'}"
            subroute="${this._subroute}"
          ></songs-page>
          <prayers-page
            class="page padded"
            ?active="${this._page === 'prayers'}"
            subroute="${this._subroute}"
          ></prayers-page>
          <ancillas-page
            class="page"
            ?active="${this._page === 'ancillas'}"
            subroute="${this._subroute}"
          ></ancillas-page>
          <holy-mass-page
            class="page padded"
            ?active="${this._page === 'holy-mass'}"
          ></holy-mass-page>
          <login-page
            class="page padded"
            ?active="${this._page === 'login'}"
            @register="${() => (this._verificationEmailSent = true)}"
          ></login-page>
          <settings-page
            class="page padded"
            ?active="${this._page === 'settings'}"
          ></settings-page>
          <info-page
            class="page padded"
            ?active="${this._page === 'info'}"
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
