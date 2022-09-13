import {
  openDB,
  DBSchema,
  IDBPDatabase,
  deleteDB,
  IDBPObjectStore,
  StoreNames,
} from 'idb';
import type { SongCategory, SongLanguage } from '../models/song';

const channel = new BroadcastChannel('db-channel');

export interface AncillappDataDBSchema extends DBSchema {
  settings: {
    key: string;
    value: string | number | boolean | Date | null | undefined;
  };
  songs: {
    key: [string, string, string];
    value: {
      language: SongLanguage;
      category: SongCategory;
      number: string;
      title: string;
      content: string;
    };
    indexes: {
      byLanguage: string;
      byCategory: string;
      byNumber: string;
      byLanguageAndCategory: [string, string];
      byLanguageAndNumber: [string, string];
      byCategoryAndNumber: [string, string];
    };
  };
  prayers: {
    key: string;
    value: {
      slug: string;
      title: {
        it?: string;
        en?: string;
        pt?: string;
        de?: string;
        la?: string;
      };
      content: {
        it?: string;
        en?: string;
        pt?: string;
        de?: string;
        la?: string;
      };
    };
  };
  ancillas: {
    key: string;
    value: {
      code: string;
      name: {
        it: string;
        en: string;
        pt: string;
        de: string;
      };
      link: string;
      thumbnail: string;
    };
  };
}

export type AncillappDataDB = IDBPDatabase<AncillappDataDBSchema>;

let dbPromise: Promise<AncillappDataDB>;

export const init = () => {
  if (!dbPromise) {
    deleteDB('ancillapp').catch(() => {
      // Try to delete the old DB, ignore errors if something goes wrong
    });
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

        db.createObjectStore('ancillas', {
          keyPath: 'code',
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
