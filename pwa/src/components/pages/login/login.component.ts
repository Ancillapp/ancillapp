import { customElement, property } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './login.styles';
import template from './login.template';

import firebase from 'firebase/app';

const auth = firebase.auth();
const analytics = firebase.analytics();

@customElement('login-page')
export class LoginPage extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _email = '';

  @property({ type: String })
  protected _password = '';

  @property({ type: Boolean })
  protected _loggingInWithEmailAndPassword = false;

  @property({ type: Boolean })
  protected _loggingInWithGoogle = false;

  @property({ type: Boolean })
  protected _loggingInWithFacebook = false;

  @property({ type: Boolean })
  protected _loggingInWithTwitter = false;

  @property({ type: Boolean })
  protected _loggingInWithMicrosoft = false;

  @property({ type: Boolean })
  protected _loggingInWithGitHub = false;

  @property({ type: Boolean })
  protected _forgotPassword = false;

  @property({ type: Boolean })
  protected _resettingPassword = false;

  @property({ type: Boolean })
  protected _passwordReset = false;

  protected async _handleEmailPasswordLogin() {
    this._loggingInWithEmailAndPassword = true;

    try {
      await auth.signInWithEmailAndPassword(this._email, this._password);

      analytics.logEvent('login', {
        method: 'Email and Password',
      });
    } catch ({ code: signInErrorCode }) {
      if (signInErrorCode === 'auth/user-not-found') {
        try {
          await auth.createUserWithEmailAndPassword(
            this._email,
            this._password,
          );

          analytics.logEvent('login', {
            method: 'Email and Password',
          });

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
    this._loggingInWithEmailAndPassword = false;
  }

  protected async _handlePasswordReset() {
    this._resettingPassword = true;

    await auth.sendPasswordResetEmail(this._email, {
      url: window.location.href,
    });

    this._resettingPassword = false;
    this._passwordReset = true;
  }

  protected async _handleGoogleLogin() {
    this._loggingInWithGoogle = true;

    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    analytics.logEvent('login', {
      method: 'Google',
    });

    this._loggingInWithGoogle = false;
  }

  protected async _handleFacebookLogin() {
    this._loggingInWithFacebook = true;

    await auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());

    analytics.logEvent('login', {
      method: 'Facebook',
    });

    this._loggingInWithFacebook = false;
  }

  protected async _handleTwitterLogin() {
    this._loggingInWithTwitter = true;

    await auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());

    analytics.logEvent('login', {
      method: 'Twitter',
    });

    this._loggingInWithTwitter = false;
  }

  protected async _handleMicrosoftLogin() {
    this._loggingInWithMicrosoft = true;

    await auth.signInWithPopup(
      new firebase.auth.OAuthProvider('microsoft.com'),
    );

    analytics.logEvent('login', {
      method: 'Microsoft',
    });

    this._loggingInWithMicrosoft = false;
  }

  protected async _handleGitHubLogin() {
    this._loggingInWithGitHub = true;

    await auth.signInWithPopup(new firebase.auth.GithubAuthProvider());

    analytics.logEvent('login', {
      method: 'GitHub',
    });

    this._loggingInWithGitHub = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
