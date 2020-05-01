import { openDB } from 'idb';

const dbPromise = openDB('keyval-store', 1, {
  upgrade(db) {
    db.createObjectStore('keyval');
  },
});

export const get = async <T>(key: string): Promise<T> =>
  (await dbPromise).get('keyval', key);

export const set = async (key: string, val: any) =>
  (await dbPromise).put('keyval', val, key);

export const remove = async (key: string) =>
  (await dbPromise).delete('keyval', key);

export const clear = async () => (await dbPromise).clear('keyval');

export const keys = async () => (await dbPromise).getAllKeys('keyval');
