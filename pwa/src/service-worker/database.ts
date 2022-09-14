import type { DBRequestEvent, ProxyDB } from '../helpers/database';

const channel = new BroadcastChannel('db-channel');

const queues: Record<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[]
> = {};

const setupEventListener = async () => {
  channel.addEventListener('message', (event) => {
    if (event.data.action !== 'database') {
      return;
    }
    if (process.env.BROWSER_ENV !== 'production') {
      console.groupCollapsed('DB response received from browser');
      const result =
        event.data.status === 'fulfilled'
          ? event.data.value
          : event.data.reason;
      console.info(
        `${event.data.method}(${event.data.args
          .map((arg: unknown) => JSON.stringify(arg))
          .join(', ')}) => ${JSON.stringify(result)} (${event.data.status})`,
      );
      console.groupEnd();
    }
    const requestId = `${event.data.method}-${event.data.args.join()}`;
    queues[requestId]?.forEach?.(({ resolve, reject }) => {
      if (event.data.status === 'fulfilled') {
        resolve(event.data.value);
      } else {
        reject(new Error(event.data.reason));
      }
    });
    queues[requestId] = [];
  });
};

const waitForRequestResponse = (request: DBRequestEvent, timeout: number) =>
  new Promise((resolve, reject) => {
    const requestId = `${request.method}-${request.args.join()}`;
    if (!queues[requestId]) {
      queues[requestId] = [];
    }
    const arrayLength = queues[requestId].push({
      resolve,
      reject,
    });
    setTimeout(() => {
      reject(new Error('Timeout'));
      queues[requestId].splice(arrayLength - 1, 1);
    }, timeout);
  });

const sendRequest = async <T extends keyof ProxyDB = keyof ProxyDB>(
  method: T,
  ...args: Parameters<ProxyDB[T]>
) => {
  const request: DBRequestEvent = {
    action: 'database',
    method,
    args,
  };
  const eventPromise = waitForRequestResponse(request, 10000);
  channel.postMessage(request);
  return eventPromise;
};

setupEventListener();
export const db = new Proxy({} as ProxyDB, {
  get:
    (_, method) =>
    (...args: unknown[]) =>
      sendRequest(
        method as keyof ProxyDB,
        ...(args as Parameters<ProxyDB[keyof ProxyDB]>),
      ),
});
