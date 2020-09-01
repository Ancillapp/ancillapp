import type Firebase from 'firebase';

import config from '../config/default.json';

let firebase: typeof Firebase;
let authInitialized = false;
let analyticsInitialized = false;

const initializeFirebase = async () => {
  if (!firebase) {
    const { default: importedFirebase } = await import('firebase/app');

    importedFirebase.initializeApp(config.firebase);

    firebase = importedFirebase;
  }

  return firebase;
};

const initializeAuth = async () => {
  await initializeFirebase();

  if (!authInitialized) {
    await import('firebase/auth');
    authInitialized = true;
  }
};

export enum Provider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  GITHUB = 'github',
}

const providersMap: Record<
  Provider,
  (auth: typeof Firebase.auth, locale: string) => firebase.auth.AuthProvider
> = {
  google: (auth) => new auth.GoogleAuthProvider(),
  facebook: (auth) => new auth.FacebookAuthProvider(),
  twitter: (auth) => new auth.TwitterAuthProvider(),
  microsoft: (auth) => new auth.OAuthProvider('microsoft.com'),
  apple: (auth, locale) => {
    const provider = new auth.OAuthProvider('apple.com');

    provider.setCustomParameters({ locale });

    return provider;
  },
  github: (auth) => new auth.GithubAuthProvider(),
};

export const loginWithProvider = async (provider: Provider, locale: string) => {
  const firebase = await initializeFirebase();
  await initializeAuth();

  const configuredProvider = providersMap[provider](firebase.auth, locale);

  await firebase.auth().signInWithPopup(configuredProvider);
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const firebase = await initializeFirebase();
  await initializeAuth();

  await firebase.auth().signInWithEmailAndPassword(email, password);
};

export const signupWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const firebase = await initializeFirebase();
  await initializeAuth();

  await firebase.auth().createUserWithEmailAndPassword(email, password);
};

export const requestPasswordReset = async (email: string, url: string) => {
  const firebase = await initializeFirebase();
  await initializeAuth();

  await firebase.auth().sendPasswordResetEmail(email, { url });
};

export const logout = async () => {
  const firebase = await initializeFirebase();
  await initializeAuth();

  await firebase.auth().signOut();
};

export const onAuthStateChanged = async (
  cb: (user: Firebase.User | null) => void,
) => {
  const firebase = await initializeFirebase();
  await initializeAuth();
  firebase.auth.GoogleAuthProvider;

  firebase.auth().onAuthStateChanged(cb);
};

export const logEvent = async (
  eventName: Parameters<
    import('firebase/app').analytics.Analytics['logEvent']
  >[0],
  eventParams?: Parameters<
    import('firebase/app').analytics.Analytics['logEvent']
  >[1],
  options?: Parameters<
    import('firebase/app').analytics.Analytics['logEvent']
  >[2],
) => {
  const firebase = await initializeFirebase();

  if (!analyticsInitialized) {
    await import('firebase/analytics');
    analyticsInitialized = true;
  }

  firebase.analytics().logEvent(
    eventName,
    {
      ...eventParams,
      offline: false,
    },
    options,
  );
};
