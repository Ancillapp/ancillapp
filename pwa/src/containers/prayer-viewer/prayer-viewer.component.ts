import { PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
import { Prayer, PrayerLanguage } from '../../models/prayer';
import { getUserLanguagesPriorityArray } from '../../helpers/prayers';

const _prayersStatusesCache = new Map<string, APIResponse<Prayer>>();

@customElement('prayer-viewer')
export class PrayerViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public prayer?: string;

  @state()
  protected _prayerStatus: APIResponse<Prayer> = {
    loading: true,
    refreshing: false,
  };

  @state()
  protected _selectedPrayerLanguage: PrayerLanguage = PrayerLanguage.ITALIAN;

  @state()
  protected _prayerLanguages: PrayerLanguage[] = [];

  @state()
  protected _userLanguagesPriorityArray = getUserLanguagesPriorityArray(
    this.locale as PrayerLanguage,
  );

  private _previousPageTitle?: string;

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.active && changedProperties.has('prayer') && this.prayer) {
      this._prayerLanguages = [];
      if (!_prayersStatusesCache.has(this.prayer)) {
        for await (const status of cacheAndNetwork<Prayer>(
          `${config.apiUrl}/prayers/${this.prayer}`,
        )) {
          this._prayerStatus = status;

          if (status.data) {
            _prayersStatusesCache.set(this.prayer, status);

            this._setupLanguageTabs();

            const prayerDefaultLanguage = this._userLanguagesPriorityArray[0];

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
    const prayerDefaultLanguage = this._userLanguagesPriorityArray[0];

    this._selectedPrayerLanguage = prayerDefaultLanguage;
    this._prayerLanguages = Object.entries(this._prayerStatus.data?.title || {})
      .sort(
        ([language1], [language2]) =>
          this._userLanguagesPriorityArray.indexOf(
            language1 as PrayerLanguage,
          ) -
          this._userLanguagesPriorityArray.indexOf(language2 as PrayerLanguage),
      )
      .map(([language]) => language) as PrayerLanguage[];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
