import { db } from './database';
import type { AncillappDataDBSchema } from '../helpers/database';

export const get = <T extends AncillappDataDBSchema['settings']['value']>(
  key: AncillappDataDBSchema['settings']['key'],
) => db.get('settings', key) as Promise<T>;

export const set = (
  key: AncillappDataDBSchema['settings']['key'],
  val: AncillappDataDBSchema['settings']['value'],
) => db.put('settings', val, key);

export const remove = (key: AncillappDataDBSchema['settings']['key']) =>
  db.delete('settings', key);

export const clear = () => db.clear('settings');

export const keys = () => db.getAllKeys('settings');
