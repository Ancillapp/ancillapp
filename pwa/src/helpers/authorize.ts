import { onAuthStateChanged } from './firebase';
import { LitElement, property } from 'lit-element';

type Constructor<T> = new (...args: any[]) => T;

export const authorize = <E extends Constructor<LitElement>>(
  BaseElement: E,
) => {
  class AuthorizedElement extends BaseElement {
    @property({ type: Object })
    public user: firebase.User | null = null;

    constructor(...args: any[]) {
      super(...args);

      onAuthStateChanged((user) => (this.user = user));
    }
  }

  return AuthorizedElement;
};
