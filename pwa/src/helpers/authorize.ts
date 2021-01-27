import { firebasePromise } from './firebase';
import { LitElement, property } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export const authorize = <E extends Constructor<LitElement>>(
  BaseElement: E,
) => {
  class AuthorizedElement extends BaseElement {
    @property({ type: Object })
    public user: firebase.default.User | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      firebasePromise.then((firebase) =>
        firebase
          .auth()
          .onAuthStateChanged(
            (user: firebase.default.User | null) => (this.user = user),
          ),
      );
    }
  }

  return AuthorizedElement;
};
