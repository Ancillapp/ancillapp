import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';

import sharedStyles from '../../shared.styles';
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

const _prayersStatusesCache = new Map<string, APIResponse<Prayer>>();

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

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('prayer') && this.prayer) {
      if (!_prayersStatusesCache.has(this.prayer)) {
        for await (const status of cacheAndNetwork<Prayer>(
          `${apiUrl}/prayers/${this.prayer}`,
        )) {
          this._prayerStatus = status;

          if (status.data) {
            _prayersStatusesCache.set(this.prayer, status);

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
      } else {
        this._prayerStatus = _prayersStatusesCache.get(this.prayer)!;
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
