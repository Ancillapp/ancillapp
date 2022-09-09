import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';

import config from '../../config/default.json';

export const app = initializeApp(config.firebase);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = getAuth(app as any);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analytics = getAnalytics(app as any);

export const logEvent = async (
  eventName: Parameters<typeof firebaseLogEvent>[1],
  eventParams?: Parameters<typeof firebaseLogEvent>[2],
  options?: Parameters<typeof firebaseLogEvent>[3],
) => {
  if (process.env.BROWSER_ENV !== 'production') {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${eventName}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { offline, ...filteredParams } = eventParams as Record<
      string,
      unknown
    >;

    if (Object.keys(filteredParams).length > 0) {
      console.info('Params:');
      console.table(filteredParams);
    }

    console.groupEnd();

    return;
  }

  return firebaseLogEvent(
    analytics,
    eventName,
    {
      ...eventParams,
      offline: false,
    },
    options,
  );
};
