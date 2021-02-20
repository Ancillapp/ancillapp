import { LitElement, property } from 'lit-element';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth } from './firebase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export const authorize = <E extends Constructor<LitElement>>(
  BaseElement: E,
) => {
  class AuthorizedElement extends BaseElement {
    @property({ type: Object })
    public user: User | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      onAuthStateChanged(auth, (user) => (this.user = user));
    }
  }

  return AuthorizedElement;
};
