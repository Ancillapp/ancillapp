import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './prayers-list.styles';
import template from './prayers-list.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';

export interface PrayerSummary {
  slug: string;
  title: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  image: string;
}

@customElement('prayers-list')
export class PrayersList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Object })
  protected _prayersStatus: APIResponse<PrayerSummary[]> = {
    loading: true,
    refreshing: false,
  };

  @property({ type: Boolean })
  protected _needPrayersDownloadPermission?: boolean;

  @property({ type: Boolean })
  protected _downloadingPrayers?: boolean;

  @property({ type: String })
  protected _selectedLanguage = 'it';

  @property({ type: Array })
  protected _displayedPrayers: PrayerSummary[] = [];

  constructor() {
    super();

    this._preparePrayers();
  }

  private async _preparePrayers() {
    const prayersDownloadPreference = await get<string>(
      'prayersDownloadPreference',
    );

    if (!prayersDownloadPreference || prayersDownloadPreference === 'no') {
      this._needPrayersDownloadPermission = true;
    }

    for await (const status of cacheAndNetwork<PrayerSummary[]>(
      `${config.apiUrl}/prayers${
        prayersDownloadPreference === 'yes' ? '?fullData' : ''
      }`,
    )) {
      this._prayersStatus = status;

      if (status.data) {
        this._displayedPrayers = status.data
          .filter(({ title }) => title[this.locale] || title.la)
          .sort(
            (
              { title: { [this.locale]: localizedTitleA, la: latinTitleA } },
              { title: { [this.locale]: localizedTitleB, la: latinTitleB } },
            ) =>
              (localizedTitleA || latinTitleA!) <
              (localizedTitleB || latinTitleB!)
                ? -1
                : 1,
          );
      }
    }
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`prayers`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`prayersDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  protected async _updatePrayersDownloadPermission(
    grant: 'yes' | 'no' | 'never',
  ) {
    if (grant === 'no') {
      await set('prayersDownloadPreference', 'no');
      this._needPrayersDownloadPermission = false;
      return;
    }

    if (grant === 'never') {
      await set('prayersDownloadPreference', 'never');
      this._needPrayersDownloadPermission = false;
      return;
    }

    this._downloadingPrayers = true;

    logEvent('download_prayers');

    for await (const { loading, refreshing, data, error } of cacheAndNetwork<
      PrayerSummary[]
    >(`${config.apiUrl}/prayers?fullData`)) {
      if (!loading && !refreshing && data && !error) {
        await set('prayersDownloadPreference', 'yes');
        this._needPrayersDownloadPermission = false;
      }
    }

    this._downloadingPrayers = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-list': PrayersList;
  }
}
