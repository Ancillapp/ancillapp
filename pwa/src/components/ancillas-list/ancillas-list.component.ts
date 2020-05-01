import { customElement, property } from 'lit-element';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './ancillas-list.styles';
import template from './ancillas-list.template';
import { urlBase64ToUint8Array } from '../../helpers/utils';

import { apiUrl, vapidPublicKey } from '../../config/default.json';

export interface Ancilla {
  code: string;
  name: {
    it: string;
    en: string;
    pt: string;
    de: string;
  };
  link: string;
  thumbnail: string;
}

@customElement('ancillas-list')
export class AncillasList extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  protected _needUserNotificationsPermission?: boolean;

  protected _ancillas: Promise<Ancilla[]> = fetch(
    `${apiUrl}/ancillas`,
  ).then((res) => res.json());

  constructor() {
    super();

    get<string>('notificationsPreference').then((notificationsPreference) => {
      if (
        Notification.permission === 'default' &&
        notificationsPreference !== 'never'
      ) {
        this._needUserNotificationsPermission = true;
      }
    });
  }

  protected async _updateNotificationsPermission(
    grant: 'yes' | 'no' | 'never',
  ) {
    if (grant === 'no' || !grant) {
      await set('notificationsPreference', 'no');
      this._needUserNotificationsPermission = false;
      return;
    }

    if (grant === 'never') {
      await set('notificationsPreference', 'never');
      this._needUserNotificationsPermission = false;
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration('/');

    if (!registration) {
      return;
    }

    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    if (Notification.permission !== 'granted') {
      return;
    }

    await fetch(`${apiUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushSubscription.toJSON()),
    });

    await set('notificationsPreference', 'yes');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillas-list': AncillasList;
  }
}
