import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { load } from '../../helpers/directives';
import { AncillasList } from './ancillas-list.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';

export default function template(this: AncillasList) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${this.localize(t`ancillas`)}
      </div>
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
    ${load(
      this._ancillas,
      (ancillas) =>
        html`
          <div class="ancillas-container">
            ${repeat(
              ancillas,
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
        `,
      (error) => html`${error.message}`,
    )}
  `;
}
