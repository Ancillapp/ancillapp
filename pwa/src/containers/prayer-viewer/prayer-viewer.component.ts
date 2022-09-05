import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './prayer-viewer.styles';
import template from './prayer-viewer.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { Prayer } from '../../models/prayer';

const _prayersStatusesCache = new Map<string, APIResponse<Prayer>>();

const _languagesOrder = ['it', 'la', 'de', 'pt', 'en'];

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

  @property({ type: String })
  protected _selectedPrayerLanguage: keyof Prayer['title'] = 'it';

  @property({ type: Array })
  protected _prayerLanguages: (keyof Prayer['title'])[] = [];

  private _previousPageTitle?: string;

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.active && changedProperties.has('prayer') && this.prayer) {
      if (!_prayersStatusesCache.has(this.prayer)) {
        for await (const status of cacheAndNetwork<Prayer>(
          `${config.apiUrl}/prayers/${this.prayer}`,
        )) {
          this._prayerStatus = status;

          if (status.data) {
            _prayersStatusesCache.set(this.prayer, status);

            this._setupLanguageTabs();

            const prayerDefaultLanguage = this._getDefaultPrayerLanguage(
              status.data,
            );

            const title = status.data.title[prayerDefaultLanguage];

            const pageTitle = `Ancillapp - ${this.localize(
              t`prayers`,
            )} - ${title}`;

            if (pageTitle === this._previousPageTitle) {
              return;
            }

            this._previousPageTitle = pageTitle;

            updateMetadata({
              title: pageTitle,
              description: this.localize(`prayerDescription ${title}`),
            });

            logEvent('page_view', {
              page_title: pageTitle,
              page_location: window.location.href,
              page_path: window.location.pathname,
            });
          }
        }
      } else {
        this._prayerStatus = _prayersStatusesCache.get(this.prayer)!;
        this._setupLanguageTabs();
      }
    }
  }

  private _setupLanguageTabs() {
    const prayerDefaultLanguage = this._getDefaultPrayerLanguage(
      this._prayerStatus.data!,
    );

    this._selectedPrayerLanguage = prayerDefaultLanguage;
    this._prayerLanguages = Object.entries(this._prayerStatus.data?.title || {})
      .filter(([, title]) => title)
      .sort(
        ([language1], [language2]) =>
          _languagesOrder.indexOf(language1) -
          _languagesOrder.indexOf(language2),
      )
      .map(([language]) => language) as (keyof Prayer['title'])[];
  }

  private _getDefaultPrayerLanguage(prayer: Prayer) {
    if (prayer.title[this.locale]) {
      return this.locale;
    }

    if (prayer.title.la) {
      return 'la';
    }

    if (prayer.title.it) {
      return 'it';
    }

    if (prayer.title.de) {
      return 'de';
    }

    if (prayer.title.pt) {
      return 'pt';
    }

    return 'en';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
