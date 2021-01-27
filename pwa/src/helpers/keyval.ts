import { initDB, AncillappDataDBSchema } from './utils';

const dbPromise = initDB();

export const get = async <T extends AncillappDataDBSchema['settings']['value']>(
  key: AncillappDataDBSchema['settings']['key'],
): Promise<T> => ((await dbPromise).get('settings', key) as unknown) as T;

export const set = async (
  key: AncillappDataDBSchema['settings']['key'],
  val: AncillappDataDBSchema['settings']['value'],
) => (await dbPromise).put('settings', val, key);

export const remove = async (key: AncillappDataDBSchema['settings']['key']) =>
  (await dbPromise).delete('settings', key);

export const clear = async () => (await dbPromise).clear('settings');

export const keys = async () => (await dbPromise).getAllKeys('settings');
