import '@material/mwc-button';
import { html } from '@polymer/lit-element';
import sharedStyles from '../../shared-styles';
import styles from './styles';
import { until } from 'lit-html/lib/until';

export default function template() {
  /* eslint-disable max-len */
  return html`
    ${sharedStyles}
    ${styles}
    ${until(this._ancillas.then((ancillas) => html`
      <section class="notifications-permission" hidden?="${!this._needUserNotificationsPermission}">
        ${this.localize('ancillas-notifications-question')}
        <div class="actions">
          <mwc-button on-click="${() => this._updateNotificationsPermission('never')}"
            label="${this.localize('ancillas-notifications-never')}"></mwc-button>
          <mwc-button on-click="${() => this._updateNotificationsPermission('no')}"
            label="${this.localize('ancillas-notifications-no')}"></mwc-button>
          <mwc-button on-click="${() => this._updateNotificationsPermission('yes')}"
            label="${this.localize('ancillas-notifications-yes')}"></mwc-button>
        </div>
      </section>
      <div class="ancillas-container">
        ${ancillas.map(({ period, special }) => html`
          <a
            href="https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/${special ? 'S' : ''}${period}.pdf"
            title="${this.localize('ancilla-title', { period, special })}"
            class="ancilla">
            <div style$="background-image: url('https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/thumbs/${special ? 'S' : ''}${period}.jpg')"></div>
          </a>
        `)}
      </div>
    `), html`
      <h4>...</h4>
    `)}
  `;
  /* eslint-enable max-len */
}
