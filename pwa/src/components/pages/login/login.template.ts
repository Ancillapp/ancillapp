import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { LoginPage } from './login.component';

import '@material/mwc-textfield';
import '../../loading-button/loading-button.component';

import type { TextField } from '@material/mwc-textfield';

export default function template(this: LoginPage) {
  return html`
    <section>
      <div>
        <h3>${this.localeData?.loginOrRegister}</h3>
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
      <div>
        <h3>Oppure effettua il login con:</h3>
        <mwc-button
          id="google"
          raised
          label="Google"
          @click="${this._handleGoogleLogin}"
        >
          <svg slot="icon" viewBox="0 0 256 256">
            <path
              fill="currentColor"
              d="M254 131c0 73-50 125-124 125a128 128 0 010-256c35 0 64 13 86 34l-35 33C135 23 51 56 51 128c0 45 35 81 79 81 51 0 70-37 73-55h-73v-44h122a112 112 0 012 21z"
            />
          </svg>
        </mwc-button>
        <mwc-button
          id="facebook"
          raised
          label="Facebook"
          @click="${this._handleFacebookLogin}"
        >
          <svg slot="icon" viewBox="0 0 256 256">
            <path
              fill="currentColor"
              d="M94 50v35H68v43h26v128h53V128h36l5-43h-41V55c0-4 6-10 12-10h29V0h-40C93 0 94 43 94 50z"
            />
          </svg>
        </mwc-button>
      </div>
    </section>
  `;
}
