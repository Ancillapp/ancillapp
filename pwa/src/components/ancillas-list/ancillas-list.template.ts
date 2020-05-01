import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { load } from '../../helpers/directives';
import { AncillasList } from './ancillas-list.component';

import '../unobtrusive-notification/unobtrusive-notification.component';

export default function template(this: AncillasList) {
  return html`
    <unobtrusive-notification
      ?hidden="${!this._needUserNotificationsPermission}"
    >
      ${this.localeData?.newAncillaNotification}
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('never')}"
        label="${this.localeData?.dontAskAnymore}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('no')}"
        label="${this.localeData?.noThanks}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('yes')}"
        label="${this.localeData?.sure}"
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
                  href="/ancillas/${code}"
                  title="${name[this.locale]}"
                  class="ancilla"
                >
                  <img src="${thumbnail}" width="340" height="480" />
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
