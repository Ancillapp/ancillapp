import { PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { get, set } from '../../helpers/keyval';
import { localize, SupportedLocale } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../../containers/page-view-element';
import Fuse from 'fuse.js';
import HyperList, { HyperListConfig } from 'hyperlist';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './songs-list.styles';
import template from './songs-list.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { SongSummary } from '../../models/song';

import type { OutlinedSelect } from '../../components/outlined-select/outlined-select.component';

@customElement('songs-list')
export class SongsList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  private _fuse?: Fuse<SongSummary>;

  private _hyperlist?: HyperList;

  private _displayedSongs: SongSummary[] = [];

  private _desktopLayout = false;

  private _songsPerRow = 1;

  @property({ type: Object })
  protected _songsStatus: APIResponse<SongSummary[]> = {
    loading: true,
    refreshing: false,
  };

  @property({ type: String })
  protected _selectedLanguage = 'it';

  @property({ type: String })
  protected _searchTerm = '';

  @property({ type: Boolean })
  protected _needSongsDownloadPermission = false;

  @property({ type: Boolean })
  protected _downloadingSongs = false;

  @property({ type: Boolean })
  protected _searching = false;

  @property({ type: Boolean })
  protected _filtersDialogOpen = false;

  @property({ type: Boolean })
  protected _numericOnly = false;

  @query('.songs-container')
  private _songsContainer?: HTMLDivElement;

  @query('#search-input')
  private _searchInput?: HTMLInputElement;

  constructor() {
    super();

    this._prepareSongs();

    get<boolean>('prefersNumericSearchKeyboard').then(
      (prefersNumericSearchKeyboard) =>
        (this._numericOnly = prefersNumericSearchKeyboard),
    );
  }

  private async _prepareSongs() {
    const supportedSongsLanguages = ['it', 'de', 'pt'];
    const [songsDownloadPreference, songsLanguage, locale] = await Promise.all([
      get<string>('songsDownloadPreference'),
      get<string>('songsLanguage'),
      get<SupportedLocale>('locale'),
    ]);

    if (!songsDownloadPreference || songsDownloadPreference === 'no') {
      this._needSongsDownloadPermission = true;
    }

    this._selectedLanguage =
      songsLanguage && supportedSongsLanguages.includes(songsLanguage)
        ? songsLanguage
        : locale && supportedSongsLanguages.includes(locale)
        ? locale
        : 'it';

    for await (const status of cacheAndNetwork<SongSummary[]>(
      `${config.apiUrl}/songs${
        songsDownloadPreference === 'yes' ? '?fullData' : ''
      }`,
    )) {
      this._songsStatus = status;

      if (status.data) {
        this._refreshSongs();
      }
    }
  }

  private _refreshSongs() {
    const songs = (this._songsStatus.data || []).filter(
      ({ language }) => language === this._selectedLanguage,
    );

    if (!this._fuse) {
      this._fuse = new Fuse(songs, {
        keys: ['number', 'title', 'content'],
        ignoreLocation: true,
      });
    } else {
      this._fuse.setCollection(songs);
    }

    this._displayedSongs = this._searchTerm
      ? this._fuse.search(this._searchTerm).map(({ item }) => item)
      : songs;

    this._renderSongs();
  }

  private _getHyperListConfig(
    displayedSongs: SongSummary[],
    desktopLayout: boolean,
    songsPerRow: number,
  ): HyperListConfig {
    return {
      itemHeight: desktopLayout ? 272 : 91,
      total: Math.ceil(displayedSongs.length / songsPerRow),
      rowClassName: 'songs-batch-container',
      generate: (index) => {
        const songs = displayedSongs.slice(
          index * songsPerRow,
          (index + 1) * songsPerRow,
        );

        const container = document.createElement('div');

        if (desktopLayout) {
          container.style.gridTemplateColumns = [...Array(songsPerRow)]
            .map(() => '1fr')
            .join(' ');
        }

        songs.forEach(({ language, category, number, title }) => {
          const anchor = document.createElement('a');
          anchor.href = this.localizeHref('songs', language, category, number);
          anchor.className = 'song';
          anchor.innerHTML = `
            <div class="book">
              <div class="number">
                ${number.endsWith('bis') ? `${number.slice(0, -3)}b` : number}
              </div>
              <div class="title">${title}</div>
            </div>
            <div class="title">${title}</div>
          `;
          anchor.addEventListener(
            'click',
            ({ altKey, ctrlKey, metaKey, shiftKey }) => {
              if (altKey || ctrlKey || metaKey || shiftKey) {
                return;
              }

              this._searchInput!.value = '';
              this._searchTerm = '';
              this._stopSearching();
              this._refreshSongs();
            },
          );

          container.appendChild(anchor);
        });

        return container;
      },
    };
  }

  private _renderSongs() {
    if (!this._songsStatus.loading && this._displayedSongs.length < 1) {
      this._songsContainer!.innerHTML = `<p>${this.localize(t`noResults`)}</p>`;
      return;
    }

    if (!this._hyperlist) {
      let lastContainerWidth = this._songsContainer!.offsetWidth;
      this._desktopLayout = lastContainerWidth >= 460;
      this._songsPerRow = this._desktopLayout
        ? Math.floor(lastContainerWidth / 192)
        : 1;

      this._hyperlist = new HyperList(
        this._songsContainer!,
        this._getHyperListConfig(
          this._displayedSongs,
          this._desktopLayout,
          this._songsPerRow,
        ),
      );

      window.addEventListener('resize', () => {
        if (this._songsContainer!.offsetWidth === lastContainerWidth) {
          return;
        }

        lastContainerWidth = this._songsContainer!.offsetWidth;

        const updatedDesktopLayout = lastContainerWidth >= 460;
        const updatedSongsPerRow = updatedDesktopLayout
          ? Math.floor(lastContainerWidth / 192)
          : 1;

        if (
          updatedDesktopLayout === this._desktopLayout &&
          updatedSongsPerRow === this._songsPerRow
        ) {
          return;
        }

        this._desktopLayout = updatedDesktopLayout;
        this._songsPerRow = updatedSongsPerRow;

        this._renderSongs();
      });
    } else {
      this._hyperlist.refresh(
        this._songsContainer!,
        this._getHyperListConfig(
          this._displayedSongs,
          this._desktopLayout,
          this._songsPerRow,
        ),
      );
    }
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
      const pageTitle = `Ancillapp - ${this.localize(t`songs`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`songsDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  protected _handleSearchKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Enter') {
      event.preventDefault();

      if (event.code === 'Escape') {
        (event.target as HTMLInputElement).value = '';
        this._searchTerm = '';
        this._stopSearching();
        this._refreshSongs();
      }

      const firstSong = this._songsContainer!.querySelector<HTMLAnchorElement>(
        '.songs-batch-container > a',
      );

      if (!firstSong) {
        return;
      }

      firstSong.focus();
    }
  }

  protected _handleSearch({ target }: InputEvent) {
    this._searchTerm = (target as HTMLInputElement).value;
    history.replaceState(
      {},
      '',
      `${window.location.pathname}?search${
        this._searchTerm ? `=${this._searchTerm}` : ''
      }`,
    );

    this._songsContainer!.scrollTo(0, 0);
    this._refreshSongs();
  }

  protected async _handleKeyboardTypeSwitch() {
    this._numericOnly = !this._numericOnly;
    this._searchInput?.focus();
    this._searchInput?.setSelectionRange(-1, -1);
    await set('prefersNumericSearchKeyboard', this._numericOnly);
  }

  protected async _handleLanguageFilter({ target }: CustomEvent<null>) {
    const newLanguage = (target as OutlinedSelect).value;

    await set('songsLanguage', newLanguage);

    this._selectedLanguage = newLanguage;
    this._refreshSongs();
    this._filtersDialogOpen = false;
  }

  protected async _updateSongsDownloadPermission(
    grant: 'yes' | 'no' | 'never',
  ) {
    if (grant === 'no') {
      await set('songsDownloadPreference', 'no');
      this._needSongsDownloadPermission = false;
      return;
    }

    if (grant === 'never') {
      await set('songsDownloadPreference', 'never');
      this._needSongsDownloadPermission = false;
      return;
    }

    this._downloadingSongs = true;

    logEvent('download_songs');

    for await (const { loading, refreshing, data, error } of cacheAndNetwork<
      SongSummary[]
    >(`${config.apiUrl}/songs?fullData`)) {
      if (!loading && !refreshing && data && !error) {
        await set('songsDownloadPreference', 'yes');
        this._needSongsDownloadPermission = false;
      }
    }

    this._downloadingSongs = false;
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
    'songs-list': SongsList;
  }
}
