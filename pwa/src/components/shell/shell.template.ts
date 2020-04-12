import { html, SVGTemplateResult } from 'lit-element';
import { nothing } from 'lit-html';
import { Shell } from './shell.component';
import * as icons from '../icons';

import '@material/mwc-top-app-bar';
import '@material/mwc-drawer';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';

export default function template(this: Shell) {
  return html`
    <mwc-drawer
      hasHeader
      type="${this._narrow ? 'dismissible' : 'modal'}"
      ?open="${this._drawerOpened}"
      @MDCDrawer:closed="${() => (this._drawerOpened = false)}"
    >
      <span slot="title">${this.localeData?.menu}</span>
      <div class="menu">
        <mwc-list activatable class="top-nav">
          ${this._topNavPages.map(
            (page) => html`
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
            `,
          )}
        </mwc-list>
        <mwc-list activatable class="bottom-nav">
          <li divider role="separator"></li>
          ${this._bottomNavPages.map(
            (page) => html`
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
            `,
          )}
        </mwc-list>
      </div>
      <div slot="appContent">
        <mwc-top-app-bar>
          <mwc-icon-button
            slot="navigationIcon"
            icon="menu"
            @click="${() => this._updateDrawerState(!this._drawerOpened)}"
          ></mwc-icon-button>
          <div slot="title">
            ${icons.tau} ${this._page === 'home'
              ? 'Ancillapp'
              : (this.localeData as { [key: string]: string })?.[this._page]}
          </div>
        </mwc-top-app-bar>
        <div>
          <p>Main Content!</p>
        </div>
      </div>
    </mwc-drawer>
  `;
}
