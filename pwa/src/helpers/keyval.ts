import { openDB, deleteDB } from 'idb';

const dbPromise = openDB('ancillapp-settings', 1, {
  upgrade(db) {
    deleteDB('keyval-store');
    db.createObjectStore('settings');
  },
});

export const get = async <T>(key: string): Promise<T> =>
  (await dbPromise).get('settings', key);

export const set = async (key: string, val: any) =>
  (await dbPromise).put('settings', val, key);

export const remove = async (key: string) =>
  (await dbPromise).delete('settings', key);

export const clear = async () => (await dbPromise).clear('settings');

export const keys = async () => (await dbPromise).getAllKeys('settings');
