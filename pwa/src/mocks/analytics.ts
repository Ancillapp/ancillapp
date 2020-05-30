import firebase from 'firebase/app';

firebase.analytics = (() => ({
  logEvent: (event: string, params?: Record<string, unknown>) => {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${event}`);
    if (params) {
      console.info('Params:');
      console.table(params);
    }
    console.groupEnd();
  },
})) as any;
