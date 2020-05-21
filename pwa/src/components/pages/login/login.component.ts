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
        } catch ({ code: signUpErrorCode }) {
          console.error(signUpErrorCode);
        }

        return;
      }

      console.error(signInErrorCode);
    }

    this._loggingIn = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
