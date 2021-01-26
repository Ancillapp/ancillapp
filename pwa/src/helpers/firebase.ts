import config from '../config/default.json';

const initializeFirebase = async () => {
  const { default: firebase } = await import('firebase/app');

  await Promise.all([import('firebase/auth'), import('firebase/analytics')]);

  firebase.initializeApp(config.firebase);

  return firebase;
};

export const firebasePromise = initializeFirebase();

export const logEvent = async (
  eventName: Parameters<
    import('firebase/app').default.analytics.Analytics['logEvent']
  >[0],
  eventParams?: Parameters<
    import('firebase/app').default.analytics.Analytics['logEvent']
  >[1],
  options?: Parameters<
    import('firebase/app').default.analytics.Analytics['logEvent']
  >[2],
) => {
  const firebase = await firebasePromise;

  firebase.analytics().logEvent(
    eventName,
    {
      ...eventParams,
      offline: false,
    },
    options,
  );
};
