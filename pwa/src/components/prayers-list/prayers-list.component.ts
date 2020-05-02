import { customElement, property } from 'lit-element';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './prayers-list.styles';
import template from './prayers-list.template';

import { apiUrl } from '../../config/default.json';

export interface PrayerSummary {
  slug: string;
  title: string;
  image: string;
}

@customElement('prayers-list')
export class PrayersList extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  protected _prayers: Promise<PrayerSummary[]> = get<string>(
    'prayersDownloadPreference',
  )
    .then((prayersDownloadPreference) =>
      fetch(
        `${apiUrl}/prayers${
          prayersDownloadPreference === 'yes' ? '?fullData' : ''
        }`,
      ),
    )
    .then((res) => res.json());

  @property({ type: Object })
  protected _displayedPrayers: Promise<PrayerSummary[]> = this._prayers;

  @property({ type: Boolean })
  protected _needPrayersDownloadPermission?: boolean;

  @property({ type: Boolean })
  protected _downloadingPrayers?: boolean;

  constructor() {
    super();

    get<string>('prayersDownloadPreference').then(
      (prayersDownloadPreference) => {
        if (!prayersDownloadPreference || prayersDownloadPreference === 'no') {
          this._needPrayersDownloadPermission = true;
        }
      },
    );
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

    try {
      const res = await fetch(`${apiUrl}/prayers?fullData`);
      await res.json();
      await set('prayersDownloadPreference', 'yes');
      this._needPrayersDownloadPermission = false;
    } catch {}

    this._downloadingPrayers = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-list': PrayersList;
  }
}
