import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import * as icons from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-drawer';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/snackbar/snackbar.component';

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
              >
                ${icons.menu}
              </mwc-icon-button>
            `
          : html`${nothing}`}
        ${icons.tau}
        <span>Ancillapp</span>
      </span>
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
                  <slot>
                    ${this.localize(
                      pagesTranslations[
                        page.replace(/-([a-z])/g, (_, letter) =>
                          letter.toUpperCase(),
                        ) as keyof typeof pagesTranslations
                      ],
                    )}
                  </slot>
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
                  <slot>${this.localize(t`logout`)}</slot>
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
                    <slot>${this.localize(t`login`)}</slot>
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
                  <slot>
                    ${this.localize(
                      pagesTranslations[
                        page.replace(/-([a-z])/g, (_, letter) =>
                          letter.toUpperCase(),
                        ) as keyof typeof pagesTranslations
                      ],
                    )}
                  </slot>
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
            class="page padded"
            ?active="${this._page === 'holy-mass'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></holy-mass-page>
          <login-page
            class="page padded"
            ?active="${this._page === 'login'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
            @register="${() => (this._verificationEmailSent = true)}"
          ></login-page>
          <settings-page
            class="page padded"
            ?active="${this._page === 'settings'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></settings-page>
          <info-page
            class="page padded"
            ?active="${this._page === 'info'}"
            ?drawer-open="${this._narrow}"
            ?show-menu-button="${!this._narrow}"
            @menutoggle="${() =>
              this._updateDrawerOpenState(!this._drawerOpened)}"
          ></info-page>
        </main>
      </div>
    </mwc-drawer>

    <snack-bar ?active="${this._updateNotificationShown}">
      <slot>${this.localize(t`updateAvailable`)}</slot>
      <mwc-button
        slot="actions"
        @click="${this._cancelUpdate}"
        label="${this.localize(t`ignore`)}"
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${this._updateApp}"
        label="${this.localize(t`updateNow`)}"
      ></mwc-button>
    </snack-bar>

    <mwc-snackbar
      leading
      ?open="${this._verificationEmailSent}"
      labelText="Fatto! Controlla la tua casella di posta per verificare il tuo indirizzo email"
    ></mwc-snackbar>
  `;
}
