import { openDB, deleteDB, DBSchema } from 'idb';

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

interface AncillappDataDBSchema extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
  songs: {
    key: string;
    value: {
      number: string;
      title: string;
      content: string;
    };
  };
  prayers: {
    key: string;
    value: {
      slug: string;
      title: string;
      content: string;
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

export const initDB = () =>
  openDB<AncillappDataDBSchema>('ancillapp', 1, {
    upgrade(db) {
      deleteDB('keyval-store');
      db.createObjectStore('settings');
      db.createObjectStore('songs', {
        keyPath: 'number',
      });
      db.createObjectStore('prayers', {
        keyPath: 'slug',
      });
      db.createObjectStore('ancillas', {
        keyPath: 'code',
      });
    },
  });
