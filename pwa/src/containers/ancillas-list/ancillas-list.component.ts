import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './ancillas-list.styles';
import template from './ancillas-list.template';
import { urlBase64ToUint8Array } from '../../helpers/utils';
import { APIResponse, cacheAndNetwork } from '../../helpers/cache-and-network';

import config from '../../config/default.json';

import { logEvent } from '../../helpers/firebase';

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
export class AncillasList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  protected _needUserNotificationsPermission?: boolean;

  @property({ type: Object })
  protected _ancillasStatus: APIResponse<Ancilla[]> = {
    loading: true,
    refreshing: false,
  };

  @property({ type: Array })
  protected _displayedAncillas: Ancilla[] = [];

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

    this._prepareAncillas();
  }

  private async _prepareAncillas() {
    for await (const status of cacheAndNetwork<Ancilla[]>(
      `${config.apiUrl}/ancillas`,
    )) {
      this._ancillasStatus = status;

      if (status.data) {
        this._displayedAncillas = status.data;
      }
    }
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`ancillas`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`ancillasDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
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
      applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
    });

    if (Notification.permission !== 'granted') {
      return;
    }

    await fetch(`${config.apiUrl}/notifications/subscribe`, {
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
