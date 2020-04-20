import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import * as icons from '../icons';

import '@material/mwc-top-app-bar';
import '@material/mwc-drawer';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
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
                      `${page}Icon`
                    ]}
                  </div>
                  <slot
                    >${(this.localeData as { [key: string]: string })?.[
                      page
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
                  <mwc-icon-button icon="arrow_back"></mwc-icon-button>
                </a>
              `
            : html`
                <mwc-icon-button
                  slot="navigationIcon"
                  icon="menu"
                  @click="${() => this._updateDrawerState(!this._drawerOpened)}"
                ></mwc-icon-button>
              `}
          <div slot="title">
            ${icons.tau} ${this._page === 'home'
              ? 'Ancillapp'
              : (this.localeData as { [key: string]: string })?.[this._page]}
          </div>
        </mwc-top-app-bar>
        <main>
          <home-page
            class="page"
            ?active="${this._page === 'home'}"
          ></home-page>
          ${undefined /*
            <ancillas-page
              class="page"
              ?active="${this._page === 'ancillas'}"
              subroute="${this._subroute}"
            ></ancillas-page>
          */}
          <songs-page
            class="page"
            ?active="${this._page === 'songs'}"
            subroute="${this._subroute}"
          ></songs-page>
          ${undefined /*
            <breviary-page
              class="page"
              ?active="${this._page === 'breviary'}"
            ></breviary-page>
          */}
          <prayers-page
            class="page"
            ?active="${this._page === 'prayers'}"
          ></prayers-page>
          <settings-page
            class="page"
            ?active="${this._page === 'settings'}"
            theme="system"
            @themechange="${console.log}"
          ></settings-page>
          <info-page
            class="page"
            ?active="${this._page === 'info'}"
          ></info-page>
        </main>
      </div>
    </mwc-drawer>

    <snack-bar ?active="${this._updateNotificationShown}">
      <slot>${this.localeData?.updateAvailable}</slot>
      <div slot="actions">
        <mwc-button
          @click="${() => (this._updateNotificationShown = false)}"
          label="${this.localeData?.ignore}"
        ></mwc-button>
        <mwc-button
          @click="${() => this._updateApp()}"
          label="${this.localeData?.updateNow}"
        ></mwc-button>
      </div>
    </snack-bar>
  `;
}
