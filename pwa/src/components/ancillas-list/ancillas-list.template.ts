import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { until } from 'lit-html/directives/until';
import { AncillasList } from './ancillas-list.component';

export default function template(this: AncillasList) {
  const ancillasTemplate = this._ancillas
    .then(
      (ancillas) =>
        html`${repeat(
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
        )}`,
    )
    .catch((error: Error) => html`${error.message}`);

  return html`
    <section
      class="notifications-permission"
      ?hidden="${!this._needUserNotificationsPermission}"
    >
      ${this.localeData?.newAncillaNotification}
      <div class="actions">
        <mwc-button
          @click="${() => this._updateNotificationsPermission('never')}"
          label="${this.localeData?.dontAskAnymore}"
          dense
        ></mwc-button>
        <mwc-button
          @click="${() => this._updateNotificationsPermission('no')}"
          label="${this.localeData?.noThanks}"
          dense
        ></mwc-button>
        <mwc-button
          @click="${() => this._updateNotificationsPermission('yes')}"
          label="${this.localeData?.sure}"
          dense
        ></mwc-button>
      </div>
    </section>
    <div class="ancillas-container">
      ${until(ancillasTemplate, html`<p>Loading...</p>`)}
    </div>
  `;
}
