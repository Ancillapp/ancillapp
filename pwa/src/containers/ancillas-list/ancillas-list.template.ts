import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { AncillasList } from './ancillas-list.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';

export default function template(this: AncillasList) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        label="${this.localize(t`menu`)}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">${this.localize(t`ancillas`)}</div>
    </top-app-bar>

    <unobtrusive-notification
      ?hidden="${!this._needUserNotificationsPermission}"
    >
      ${this.localize(t`newAncillaNotification`)}
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('never')}"
        label="${this.localize(t`dontAskAnymore`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('no')}"
        label="${this.localize(t`noThanks`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('yes')}"
        label="${this.localize(t`sure`)}"
        primary
        dense
      ></mwc-button>
    </unobtrusive-notification>

    ${this._ancillasStatus.loading || !this._ancillasStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <div class="ancillas-container">
            ${this._ancillasStatus.data.length < 1
              ? html`<p>${this.localize(t`noResults`)}</p>`
              : html`${nothing}`}
            ${repeat(
              this._displayedAncillas,
              ({ code }) => code,
              ({ code, name, thumbnail }) => html`
                <a
                  href="${this.localizeHref('ancillas', code)}"
                  title="Ancilla Domini - ${name[this.locale]}"
                  class="ancilla"
                >
                  <img
                    src="${thumbnail}"
                    alt="Ancilla Domini - ${name[this.locale]}"
                    width="340"
                    height="480"
                    loading="lazy"
                  />
                  <p>${name[this.locale]}</p>
                </a>
              `,
            )}
          </div>
        `}

    <mwc-snackbar
      leading
      ?open="${this._ancillasStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
