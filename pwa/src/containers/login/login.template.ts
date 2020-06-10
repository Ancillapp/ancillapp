import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { LoginPage } from './login.component';
import { menu, tau } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-textfield';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/loading-button/loading-button.component';

import type { TextField } from '@material/mwc-textfield';

export default function template(this: LoginPage) {
  const loggingIn =
    this._loggingInWithEmailAndPassword ||
    this._loggingInWithGoogle ||
    this._loggingInWithFacebook ||
    this._loggingInWithTwitter ||
    this._loggingInWithMicrosoft ||
    this._loggingInWithGitHub;

  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${tau} ${this.localize(t`login`)}
      </div>
    </top-app-bar>

    <section>
      <div>
        <h3>${this.localize(t`loginOrRegister`)}</h3>
        <mwc-textfield
          outlined
          type="email"
          label="Email"
          value="${this._email}"
          @input="${(event: CustomEvent) => {
            this._email = (event.target as TextField).value;
            this._error = '';
          }}"
        ></mwc-textfield>
        ${this._forgotPassword
          ? html`
              <loading-button
                raised
                label="${this.localize(t`resetPassword`)}"
                @click="${this._handlePasswordReset}"
                ?loading="${this._resettingPassword}"
                ?disabled="${this._passwordReset || loggingIn}"
              ></loading-button>

              ${this._passwordReset
                ? html`<p>${this.localize(t`checkYourInbox`)}</p>`
                : html`${nothing}`}
            `
          : html`
              <mwc-textfield
                outlined
                type="password"
                label="Password"
                value="${this._password}"
                @input="${(event: CustomEvent) => {
                  this._password = (event.target as TextField).value;
                  this._error = '';
                }}"
              ></mwc-textfield>
              <loading-button
                raised
                label="${this.localize(t`login`)}"
                @click="${this._handleEmailPasswordLogin}"
                ?loading="${this._loggingInWithEmailAndPassword}"
                ?disabled="${loggingIn}"
              ></loading-button>
            `}
        ${this._error ? html`<p>${this._error}</p>` : html`${nothing}`}
        <p>
          <a
            role="button"
            tabindex="0"
            @click="${() => (this._forgotPassword = !this._forgotPassword)}"
          >
            ${this._forgotPassword
              ? this.localize(t`backToLogin`)
              : this.localize(t`forgotPassword`)}
          </a>
        </p>
      </div>
      <div>
        <h3>Oppure effettua il login con:</h3>
        <loading-button
          id="google"
          raised
          label="Google"
          @click="${this._handleGoogleLogin}"
          ?loading="${this._loggingInWithGoogle}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M254 131c0 73-50 125-124 125a128 128 0 010-256c35 0 64 13 86 34l-35 33C135 23 51 56 51 128c0 45 35 81 79 81 51 0 70-37 73-55h-73v-44h122a112 112 0 012 21z"
            />
          </svg>
        </loading-button>
        <loading-button
          id="facebook"
          raised
          label="Facebook"
          @click="${this._handleFacebookLogin}"
          ?loading="${this._loggingInWithFacebook}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M94 50v35H68v43h26v128h53V128h36l5-43h-41V55c0-4 6-10 12-10h29V0h-40C93 0 94 43 94 50z"
            />
          </svg>
        </loading-button>
        <loading-button
          id="twitter"
          raised
          label="Twitter"
          @click="${this._handleTwitterLogin}"
          ?loading="${this._loggingInWithTwitter}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 256 256" fill="currentColor">
            <path
              d="M256 49a105 105 0 0 1-30 8 53 53 0 0 0 23-29 106 106 0 0 1-33 13 53 53 0 0 0-90 48A149 149 0 0 1 18 34a53 53 0 0 0 16 70 53 53 0 0 1-24-7v1a53 53 0 0 0 42 51 53 53 0 0 1-13 2 50 50 0 0 1-10-1 53 53 0 0 0 49 37 105 105 0 0 1-66 22 112 112 0 0 1-12-1 148 148 0 0 0 81 24c96 0 149-80 149-149v-7a105 105 0 0 0 26-27z"
            />
          </svg>
        </loading-button>
        <loading-button
          id="microsoft"
          raised
          label="Microsoft"
          @click="${this._handleMicrosoftLogin}"
          ?loading="${this._loggingInWithMicrosoft}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 23 23" fill="currentColor">
            <path d="M1 1h10v10H1z" />
            <path d="M12 1h10v10H12z" />
            <path d="M1 12h10v10H1z" />
            <path d="M12 12h10v10H12z" />
          </svg>
        </loading-button>
        <loading-button
          id="apple"
          raised
          label="Apple"
          @click="${this._handleAppleLogin}"
          ?loading="${this._loggingInWithApple}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 1000 1187" fill="currentColor">
            <path
              d="M979 925c-18 42-39 80-64 115-33 48-61 81-82 99-33 31-68 46-106 47-27 0-59-8-97-23-38-16-73-24-105-24-34 0-70 8-108 24-39 15-70 23-94 24-36 2-72-14-108-48A712 712 0 010 640c0-79 17-148 52-205a303 303 0 01254-151c29 0 66 9 113 27 47 17 77 26 90 26 9 0 43-10 99-31 53-19 98-27 135-24 100 8 175 47 225 118a250 250 0 00-133 227c1 76 29 139 83 189 24 23 52 41 82 54l-21 55zM750 24c0 59-22 115-65 166-52 61-115 96-184 91l-1-23c0-57 25-118 69-168 22-25 50-46 84-63 34-16 66-25 96-27l1 24z"
            />
          </svg>
        </loading-button>
        <loading-button
          id="github"
          raised
          label="GitHub"
          @click="${this._handleGitHubLogin}"
          ?loading="${this._loggingInWithGitHub}"
          ?disabled="${loggingIn}"
        >
          <svg slot="icon" viewBox="0 0 1012 1089" fill="currentColor">
            <path
              d="M171 776zm562 273a671 671 0 01-378 23v-39l-1-66c-193 35-238-101-240-107-30-77-72-97-73-97l-1-1c-97-66 11-65 11-65h1c76 5 117 75 119 79 23 40 52 60 80 68 41 11 82-1 107-11a198 198 0 0131-78c-73-10-147-32-205-80-64-54-107-140-107-281a298 298 0 0171-194c-4-12-10-33-12-61-2-34 2-79 22-130V8s9-7 22-8c8 0 20 0 37 4 32 6 82 24 150 70a661 661 0 01177-23 723 723 0 01176 23C858-18 921 2 922 2l5 2 2 5c21 51 24 96 22 130-2 28-8 49-12 61a286 286 0 0172 194c0 141-44 227-108 281-58 48-132 69-205 80 8 11 16 25 22 41 8 23 13 50 13 82zM137 801c5 1 9 5 9 10-1 4-5 7-10 7-6-1-9-5-9-9 1-5 5-8 10-8zm19 50c1-5 5-8 10-8 5 1 9 5 9 10-1 4-5 7-10 7-5-1-9-5-9-9zM90 737c5 1 9 5 8 9 0 5-5 8-10 8-5-1-9-5-8-10 0-4 5-7 10-7zm25 27c5 1 8 5 8 10-1 4-5 8-10 7s-9-5-8-9c0-5 4-8 10-8zm91 108c5 1 9 5 8 10 0 4-5 7-10 7-5-1-9-5-8-9 0-5 5-8 10-8zm56 16c5 0 9 4 9 9-1 5-5 8-10 7-5 0-9-4-9-9 1-5 5-8 10-7zm53-5c5 1 9 5 8 10 0 4-5 8-10 7-5 0-9-5-8-9 0-5 5-8 10-8z"
            />
          </svg>
        </loading-button>
      </div>
    </section>
  `;
}
