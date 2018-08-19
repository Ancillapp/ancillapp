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
      <div class="notifications-permission" hidden?="${!_needUserNotificationsPermission}">
        Vuoi ricevere le notifiche ogni volta che viene pubblicato un nuovo Ancilla Domini?
        <mwc-button on-click="${() => this._updateNotificationsPermission(false)}">No, grazie</mwc-button>
        <mwc-button on-click="${() => this._updateNotificationsPermission(true)}">Certo!</mwc-button>
      </div>
      <div class="ancillas-container">
        ${ancillas.map((ancilla) => html`
          <a href="https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/${ancilla}.pdf" class="ancilla">
            <div style$="background-image: url('https://storage.googleapis.com/ffb-ancillapp.appspot.com/ancillas/thumbs/${ancilla}.jpg')"></div>
          </a>
        `)}
      </div>
    `), html`
      <h4>...</h4>
    `)}
  `;
  /* eslint-enable max-len */
}
