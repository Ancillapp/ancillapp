/* eslint-disable no-console */
import firebase from 'firebase/app';

firebase.analytics = (() => ({
  logEvent: (event: string, params: Record<string, unknown> = {}) => {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${event}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { offline, ...filteredParams } = params;

    if (Object.keys(filteredParams).length > 0) {
      console.info('Params:');
      console.table(filteredParams);
    }

    console.groupEnd();
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;
