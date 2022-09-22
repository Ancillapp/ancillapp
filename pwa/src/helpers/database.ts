import {
  openDB,
  DBSchema,
  IDBPDatabase,
  IDBPObjectStore,
  StoreNames,
} from 'idb';
import type { Magazine } from '../models/magazine';
import type { Prayer } from '../models/prayer';
import type { Song } from '../models/song';

const channel = new BroadcastChannel('db-channel');

export interface AncillappDataDBSchema extends DBSchema {
  settings: {
    key: string;
    value: string | number | boolean | Date | null | undefined;
  };
  songs: {
    key: [Song['language'], Song['category'], Song['number']];
    value: Song;
    indexes: {
      byLanguage: Song['language'];
      byCategory: Song['category'];
      byNumber: Song['number'];
      byLanguageAndCategory: [Song['language'], Song['category']];
      byLanguageAndNumber: [Song['language'], Song['number']];
      byCategoryAndNumber: [Song['category'], Song['number']];
    };
  };
  prayers: {
    key: Prayer['slug'];
    value: Prayer;
  };
  magazines: {
    key: [Magazine['type'], Magazine['code']];
    value: Magazine;
  };
}

export type AncillappDataDB = IDBPDatabase<AncillappDataDBSchema>;

let dbPromise: Promise<AncillappDataDB>;

export const init = () => {
  if (!dbPromise) {
    dbPromise = openDB<AncillappDataDBSchema>('ancillapp-data', 1, {
      upgrade(db) {
        db.createObjectStore('settings');

        const songsStore = db.createObjectStore('songs', {
          keyPath: ['language', 'category', 'number'],
        });
        songsStore.createIndex('byLanguage', 'language');
        songsStore.createIndex('byCategory', 'category');
        songsStore.createIndex('byNumber', 'number');
        songsStore.createIndex('byLanguageAndCategory', [
          'language',
          'category',
        ]);
        songsStore.createIndex('byLanguageAndNumber', ['language', 'number']);
        songsStore.createIndex('byCategoryAndNumber', ['category', 'number']);

        db.createObjectStore('prayers', {
          keyPath: 'slug',
        });

        db.createObjectStore('magazines', {
          keyPath: ['type', 'code'],
        });
      },
    });
  }
  return dbPromise;
};

export interface DBRequestEvent<T extends keyof ProxyDB = keyof ProxyDB> {
  action: 'database';
  method: T;
  args: Parameters<ProxyDB[T]>;
}

export type AncillappDataObjectStore = IDBPObjectStore<
  AncillappDataDBSchema,
  StoreNames<AncillappDataDBSchema>[],
  StoreNames<AncillappDataDBSchema>,
  'readwrite'
>;

export type ProxyObjectStore = Pick<
  AncillappDataObjectStore,
  | 'add'
  | 'clear'
  | 'count'
  | 'delete'
  | 'get'
  | 'getAll'
  | 'getAllKeys'
  | 'getKey'
  | 'put'
>;

export interface ProxyDBBatchOperation<
  T extends keyof ProxyObjectStore = keyof ProxyObjectStore,
> {
  objectStore: StoreNames<AncillappDataDBSchema>;
  method: T;
  args: Parameters<ProxyObjectStore[T]>;
}

export interface ProxyDB
  extends Pick<
    AncillappDataDB,
    // Allowed DB methods through the proxy
    | 'add'
    | 'clear'
    | 'count'
    | 'countFromIndex'
    | 'delete'
    | 'get'
    | 'getFromIndex'
    | 'getAll'
    | 'getAllFromIndex'
    | 'getAllKeys'
    | 'getAllKeysFromIndex'
    | 'getKey'
    | 'getKeyFromIndex'
    | 'put'
  > {
  batch(
    // We need this double type because TypeScript is buggy
    // when multiple signatures exist for the same function
    entities:
      | Parameters<AncillappDataDB['transaction']>[0]
      | Parameters<AncillappDataDB['transaction']>[0][0],
    mode: Parameters<AncillappDataDB['transaction']>[1],
    options: Parameters<AncillappDataDB['transaction']>[2],
    operations: ProxyDBBatchOperation[],
  ): Promise<void>;
}

const handleRequest = async (event: MessageEvent<DBRequestEvent>) => {
  if (process.env.BROWSER_ENV !== 'production') {
    console.groupCollapsed('DB request received from SW');
    console.info(
      `${event.data.method}(${event.data.args
        .map((arg) => JSON.stringify(arg))
        .join(', ')})`,
    );
    console.groupEnd();
  }

  const db = await init();
  switch (event.data.method) {
    case 'batch': {
      const [entities, mode, options, operations] = event.data
        .args as Parameters<ProxyDB['batch']>;
      // We need this cast to any for the same reason above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transaction = db.transaction(entities as any, mode, options);

      const objectStores: Record<string, ProxyObjectStore> = {};

      operations.forEach(({ objectStore, method, args }) => {
        if (!objectStores[objectStore]) {
          objectStores[objectStore] = transaction.objectStore(
            objectStore,
          ) as ProxyObjectStore;
        }
        // TODO: discover what's wrong with this type 🛟
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (objectStores[objectStore][method] as any)(...args);
      });

      try {
        await transaction.done;
        channel.postMessage({
          ...event.data,
          status: 'fulfilled',
        });
      } catch (reason) {
        channel.postMessage({
          ...event.data,
          status: 'rejected',
          reason,
        });
      }

      break;
    }
    default: {
      try {
        // TODO: same as above 🛟
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = await (db as any)[event.data.method](...event.data.args);
        channel.postMessage({
          ...event.data,
          status: 'fulfilled',
          value,
        });
      } catch (reason) {
        channel.postMessage({
          ...event.data,
          status: 'rejected',
          reason,
        });
      }
      break;
    }
  }
};

channel.addEventListener('message', handleRequest);
