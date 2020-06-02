import { customElement, property } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../pages/page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';

import sharedStyles from '../shared.styles';
import styles from './prayer-viewer.styles';
import template from './prayer-viewer.template';

import { apiUrl } from '../../config/default.json';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

export interface Prayer {
  slug: string;
  title: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  content: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
}

@customElement('prayer-viewer')
export class PrayerViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public prayer?: string;

  @property({ type: Object })
  protected _prayerStatus: APIResponse<Prayer> = {
    loading: true,
    refreshing: false,
  };

  private _previousPageTitle?: string;

  private async _fetchPrayer(slug: string) {
    for await (const status of cacheAndNetwork<Prayer>(
      `${apiUrl}/prayers/${slug}`,
    )) {
      this._prayerStatus = status;

      if (status.data) {
        const prayerTitle =
          status.data.title[this.locale] || status.data.title.la!;

        const pageTitle = `Ancillapp - ${this.localeData.prayers} - ${prayerTitle}`;

        if (pageTitle === this._previousPageTitle) {
          return;
        }

        this._previousPageTitle = pageTitle;

        updateMetadata({
          title: pageTitle,
          description: this.localeData.prayerDescription(prayerTitle),
        });

        analytics.logEvent('page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: window.location.pathname,
          offline: false,
        });
      }
    }
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (this.active && name === 'prayer' && value && old !== value) {
      this._fetchPrayer(value);
    }
    super.attributeChangedCallback(name, old, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
