import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { LoginPage } from './login.component';

import '@material/mwc-textfield';
import '../../loading-button/loading-button.component';

import type { TextField } from '@material/mwc-textfield';

export default function template(this: LoginPage) {
  return html`
    <section>
      <h3>${this.localeData?.loginOrRegister}</h3>
      <div>
        <mwc-textfield
          outlined
          type="email"
          label="Email"
          value="${this._email}"
          @change="${(event: CustomEvent) =>
            (this._email = (event.target as TextField).value)}"
        ></mwc-textfield>
        ${this._forgotPassword
          ? html`
              <loading-button
                raised
                label="${this.localeData?.resetPassword}"
                @click="${this._handlePasswordReset}"
                ?loading="${this._resettingPassword}"
                ?disabled="${this._passwordReset}"
              ></loading-button>

              ${this._passwordReset
                ? html`<p>${this.localeData?.checkYourInbox}</p>`
                : html`${nothing}`}
            `
          : html`
              <mwc-textfield
                outlined
                type="password"
                label="Password"
                value="${this._password}"
                @change="${(event: CustomEvent) =>
                  (this._password = (event.target as TextField).value)}"
              ></mwc-textfield>
              <loading-button
                raised
                label="${this.localeData?.login}"
                @click="${this._handleEmailPasswordLogin}"
                ?loading="${this._loggingIn}"
              ></loading-button>
            `}
        <p>
          <a
            role="button"
            tabindex="0"
            @click="${() => (this._forgotPassword = !this._forgotPassword)}"
          >
            ${this._forgotPassword
              ? this.localeData?.backToLogin
              : this.localeData?.forgotPassword}
          </a>
        </p>
      </div>
    </section>
  `;
}
