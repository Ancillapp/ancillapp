import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './login.styles';
import template from './login.template';

import { firebasePromise, logEvent } from '../../helpers/firebase';

@customElement('login-page')
export class LoginPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _email = '';

  @property({ type: String })
  protected _password = '';

  @property({ type: String })
  protected _error = '';

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
  protected _loggingInWithApple = false;

  @property({ type: Boolean })
  protected _loggingInWithGitHub = false;

  @property({ type: Boolean })
  protected _forgotPassword = false;

  @property({ type: Boolean })
  protected _resettingPassword = false;

  @property({ type: Boolean })
  protected _passwordReset = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`login`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`loginDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  protected async _handleEmailPasswordLogin() {
    if (!this._email) {
      this._error = this.localize(t`missingEmail`);
      return;
    }

    if (!this._password) {
      this._error = this.localize(t`missingPassword`);
      return;
    }

    this._loggingInWithEmailAndPassword = true;

    const firebase = await firebasePromise;

    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(this._email, this._password);

      logEvent('login', { method: 'Email and Password' });

      this._email = '';
      this._password = '';
      this._error = '';
    } catch ({ code: signInErrorCode }) {
      let error = signInErrorCode;

      if (error === 'auth/user-not-found') {
        try {
          await firebase
            .auth()
            .createUserWithEmailAndPassword(this._email, this._password);

          logEvent('login', { method: 'Email and Password' });

          this.dispatchEvent(new CustomEvent('register'));

          this._email = '';
          this._password = '';
          this._error = '';
        } catch ({ code: signUpErrorCode }) {
          error = signUpErrorCode;
        }
      }

      switch (error) {
        case 'auth/invalid-email':
          this._error = this.localize(t`invalidEmail`);
          break;
        case 'auth/wrong-password':
          this._error = this.localize(t`wrongPassword`);
          break;
        default:
          this._error = this.localize(t`unexpectedError`);
      }
    }

    this._loggingInWithEmailAndPassword = false;
  }

  protected async _handlePasswordReset() {
    this._resettingPassword = true;

    const firebase = await firebasePromise;

    await firebase.auth().sendPasswordResetEmail(this._email, {
      url: window.location.href,
    });

    this._resettingPassword = false;
    this._passwordReset = true;
  }

  protected async _handleGoogleLogin() {
    this._loggingInWithGoogle = true;

    const firebase = await firebasePromise;

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider());

    logEvent('login', { method: 'Google' });

    this._loggingInWithGoogle = false;
  }

  protected async _handleFacebookLogin() {
    this._loggingInWithFacebook = true;

    const firebase = await firebasePromise;

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.FacebookAuthProvider());

    logEvent('login', { method: 'Facebook' });

    this._loggingInWithFacebook = false;
  }

  protected async _handleTwitterLogin() {
    this._loggingInWithTwitter = true;

    const firebase = await firebasePromise;

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.TwitterAuthProvider());

    logEvent('login', { method: 'Twitter' });

    this._loggingInWithTwitter = false;
  }

  protected async _handleMicrosoftLogin() {
    this._loggingInWithMicrosoft = true;

    const firebase = await firebasePromise;

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.OAuthProvider('microsoft.com'));

    logEvent('login', { method: 'Microsoft' });

    this._loggingInWithMicrosoft = false;
  }

  protected async _handleAppleLogin() {
    this._loggingInWithApple = true;

    const firebase = await firebasePromise;

    const provider = new firebase.auth.OAuthProvider('apple.com');
    provider.setCustomParameters({
      locale: this.locale,
    });

    await firebase.auth().signInWithPopup(provider);

    logEvent('login', { method: 'Apple' });

    this._loggingInWithApple = false;
  }

  protected async _handleGitHubLogin() {
    this._loggingInWithGitHub = true;

    const firebase = await firebasePromise;

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.GithubAuthProvider());

    logEvent('login', { method: 'GitHub' });

    this._loggingInWithGitHub = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
