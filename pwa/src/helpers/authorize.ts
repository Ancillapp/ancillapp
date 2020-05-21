import firebase from 'firebase/app';
import { LitElement, property } from 'lit-element';

type Constructor<T> = new (...args: any[]) => T;

const auth = firebase.auth();

export const authorize = <E extends Constructor<LitElement>>(
  BaseElement: E,
) => {
  class AuthorizedElement extends BaseElement {
    @property({ type: Object })
    public user: firebase.User | null = null;

    constructor(...args: any[]) {
      super(...args);

      auth.onAuthStateChanged(
        (user: firebase.User | null) => (this.user = user),
      );
    }
  }

  return AuthorizedElement;
};
