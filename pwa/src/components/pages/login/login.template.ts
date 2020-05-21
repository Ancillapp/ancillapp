import { html } from 'lit-element';
import { LoginPage } from './login.component';
import { google, facebook } from '../../icons';

import '@material/mwc-textfield';
import '../../loading-button/loading-button.component';

import type { TextField } from '@material/mwc-textfield';

export default function template(this: LoginPage) {
  return html`
    <section>
      <h3>Entra o registrati</h3>
      <div>
        <mwc-textfield
          outlined
          type="email"
          label="Email"
          value="${this._email}"
          @change="${(event: CustomEvent) =>
            (this._email = (event.target as TextField).value)}"
        ></mwc-textfield>
        <mwc-textfield
          outlined
          type="password"
          label="Password"
          value="${this._password}"
          @change="${(event: CustomEvent) =>
            (this._password = (event.target as TextField).value)}"
        ></mwc-textfield>
        <loading-button
          label="${this.localeData?.login}"
          @click="${this._handleEmailPasswordLogin}"
        ></loading-button>
      </div>
    </section>
  `;
}
