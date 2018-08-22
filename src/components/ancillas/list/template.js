import '@material/mwc-button';
import { html } from '@polymer/lit-element';
import sharedStyles from '../../shared-styles';
import styles from './styles';
import { until } from 'lit-html/lib/until';

export default function template({ _needUserNotificationsPermission, _ancillas }) {
  /* eslint-disable max-len */
  return html`
    ${sharedStyles}
    ${styles}
    ${until(_ancillas.then((ancillas) => html`
      <section class="notifications-permission" hidden?="${!_needUserNotificationsPermission}">
        Vuoi ricevere le notifiche ogni volta che viene pubblicato un nuovo Ancilla Domini?
        <div class="actions">
          <mwc-button on-click="${() => this._updateNotificationsPermission('never')}"
            label="Non chiedermelo più"></mwc-button>
          <mwc-button on-click="${() => this._updateNotificationsPermission('no')}"
            label="No, grazie"></mwc-button>
          <mwc-button on-click="${() => this._updateNotificationsPermission('yes')}"
            label="Certo!"></mwc-button>
        </div>
      </section>
      <div class="ancillas-container">
        ${ancillas.map(({ period, special }) => html`
          <a
            href="https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/${period}.pdf"
            title="${this.localize('ancilla-title', { period, special })}"
            class="ancilla">
            <div style$="background-image: url('https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/thumbs/${period}.jpg')"></div>
          </a>
        `)}
      </div>
    `), html`
      <h4>...</h4>
    `)}
  `;
  /* eslint-enable max-len */
}
