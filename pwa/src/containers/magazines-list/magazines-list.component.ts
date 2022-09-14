import { PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './magazines-list.styles';
import template from './magazines-list.template';
import { urlBase64ToUint8Array } from '../../helpers/utils';
import { APIResponse, cacheAndNetwork } from '../../helpers/cache-and-network';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { Magazine, MagazineType } from '../../models/magazine';

@customElement('magazines-list')
export class MagazinesList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  protected _needUserNotificationsPermission?: boolean;

  @property({ type: Object })
  protected _magazinesStatus: APIResponse<Magazine[]> = {
    loading: true,
    refreshing: false,
  };

  @state()
  protected _magazines: Magazine[] = [];

  @state()
  protected _displayedMagazines: Magazine[] = [];

  @property({ type: String })
  public type?: MagazineType;

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

    this._prepareMagazines();
  }

  private async _prepareMagazines() {
    for await (const status of cacheAndNetwork<Magazine[]>(
      `${config.apiUrl}/magazines`,
    )) {
      this._magazinesStatus = status;

      if (status.data) {
        this._magazines = status.data;
      }
    }
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      (changedProperties.has('type') || changedProperties.has('_magazines')) &&
      this.active &&
      this.type &&
      this._magazines
    ) {
      this._displayedMagazines = this._magazines
        .filter(({ type }) => type === this.type)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

      if (changedProperties.has('active')) {
        const magazineType =
          this.type === MagazineType.ANCILLA_DOMINI
            ? 'Ancilla Domini'
            : '#sempreconnessi';

        const pageTitle = `Ancillapp - ${this.localize(
          t`magazines`,
        )} - ${magazineType}`;

        updateMetadata({
          title: pageTitle,
          description: this.localize(t`magazinesDescription ${magazineType}`),
        });

        logEvent('page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }
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
    'magazines-list': MagazinesList;
  }
}
