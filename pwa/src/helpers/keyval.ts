import { init } from './database';
import type { AncillappDataDBSchema } from './database';

export const get = async <T extends AncillappDataDBSchema['settings']['value']>(
  key: AncillappDataDBSchema['settings']['key'],
) => (await init()).get('settings', key) as Promise<T>;

export const set = async (
  key: AncillappDataDBSchema['settings']['key'],
  val: AncillappDataDBSchema['settings']['value'],
) => (await init()).put('settings', val, key);

export const remove = async (key: AncillappDataDBSchema['settings']['key']) =>
  (await init()).delete('settings', key);

export const clear = async () => (await init()).clear('settings');

export const keys = async () => (await init()).getAllKeys('settings');
