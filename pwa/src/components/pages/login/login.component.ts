import { customElement, property } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './login.styles';
import template from './login.template';

import firebase from 'firebase/app';

const auth = firebase.auth();

@customElement('login-page')
export class LoginPage extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _email = '';

  @property({ type: String })
  protected _password = '';

  @property({ type: Boolean })
  protected _loggingIn = false;

  @property({ type: Boolean })
  protected _forgotPassword = false;

  @property({ type: Boolean })
  protected _resettingPassword = false;

  @property({ type: Boolean })
  protected _passwordReset = false;

  protected async _handleEmailPasswordLogin() {
    this._loggingIn = true;

    try {
      await auth.signInWithEmailAndPassword(this._email, this._password);
    } catch ({ code: signInErrorCode }) {
      if (signInErrorCode === 'auth/user-not-found') {
        try {
          await auth.createUserWithEmailAndPassword(
            this._email,
            this._password,
          );

          this.dispatchEvent(new CustomEvent('register'));
        } catch ({ code: signUpErrorCode }) {
          console.error(signUpErrorCode);
        }
      } else {
        console.error(signInErrorCode);
      }
    }

    this._email = '';
    this._password = '';
    this._loggingIn = false;
  }

  protected async _handlePasswordReset() {
    this._resettingPassword = true;

    await auth.sendPasswordResetEmail(this._email, {
      url: window.location.href,
    });

    this._resettingPassword = false;
    this._passwordReset = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
