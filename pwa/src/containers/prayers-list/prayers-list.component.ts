import { PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
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
import { PrayerLanguage, PrayerSummary } from '../../models/prayer';

import * as PrayersListWorker from './prayers-list.worker';
import {
  getPrayerDisplayedTitle,
  getUserLanguagesPriorityArray,
} from '../../helpers/prayers';

const { configureSearch, search } =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (PrayersListWorker as any)() as typeof PrayersListWorker;

@customElement('prayers-list')
export class PrayersList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @state()
  protected _prayersStatus: APIResponse<PrayerSummary[]> = {
    loading: true,
    refreshing: false,
  };

  @state()
  protected _needPrayersDownloadPermission?: boolean;

  @state()
  protected _downloadingPrayers?: boolean;

  @state()
  protected _selectedLanguage = 'it';

  @state()
  protected _searchTerm = '';

  @state()
  protected _searching = false;

  @state()
  protected _displayedPrayers: PrayersListWorker.ExtendedPrayer[] = [];

  @state()
  protected _userLanguagesPriorityArray = getUserLanguagesPriorityArray(
    this.locale as PrayerLanguage,
  );

  @query('#search-input')
  private _searchInput?: HTMLInputElement;

  @query('.prayers-container')
  private _prayersContainer?: HTMLDivElement;

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
        this._refreshPrayers();
      }
    }
  }

  private async _refreshPrayers() {
    const prayers = (this._prayersStatus.data || [])
      .map(
        (prayer) =>
          ({
            ...prayer,
            displayedTitle: getPrayerDisplayedTitle(
              prayer,
              this._userLanguagesPriorityArray,
            ),
          } as PrayersListWorker.ExtendedPrayer),
      )
      .sort((a, b) => a.displayedTitle.localeCompare(b.displayedTitle));

    await configureSearch(prayers);

    this._displayedPrayers = this._searchTerm
      ? await search(this._searchTerm)
      : prayers;
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    const searchParam = new URLSearchParams(window.location.search).get(
      'search',
    );

    this._searching = searchParam !== null;
    this._searchTerm = searchParam || '';

    if (
      changedProperties.has('_searching') &&
      this._searching &&
      this._searchInput
    ) {
      this._searchInput.focus();
      this._searchInput.setSelectionRange(-1, -1);
    }

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

  protected async _handleSearchKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Enter') {
      event.preventDefault();

      if (event.code === 'Escape') {
        (event.target as HTMLInputElement).value = '';
        this._searchTerm = '';
        this._stopSearching();
        await this._refreshPrayers();
      }

      const firstPrayer =
        this._prayersContainer!.querySelector<HTMLAnchorElement>(
          '.songs-batch-container > a',
        );

      if (!firstPrayer) {
        return;
      }

      firstPrayer.focus();
    }
  }

  protected async _handleSearch({ target }: InputEvent) {
    this._searchTerm = (target as HTMLInputElement).value;
    history.replaceState(
      {},
      '',
      `${window.location.pathname}?search${
        this._searchTerm ? `=${this._searchTerm}` : ''
      }`,
    );

    this._prayersContainer!.scrollTo(0, 0);
    await this._refreshPrayers();
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

  protected async _handlePrayerClick({
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
  }: MouseEvent) {
    if (altKey || ctrlKey || metaKey || shiftKey) {
      return;
    }

    this._searchInput!.value = '';
    this._searchTerm = '';
    this._stopSearching();
    await this._refreshPrayers();
  }

  protected _startSearching() {
    this._searching = true;
    history.replaceState({}, '', `${window.location.pathname}?search`);
  }

  protected _stopSearching() {
    this._searching = false;
    history.replaceState({}, '', window.location.pathname);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-list': PrayersList;
  }
}
