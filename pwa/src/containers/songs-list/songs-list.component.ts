import { PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { get, set } from '../../helpers/keyval';
import { localize, SupportedLocale } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../../containers/page-view-element';
import HyperList, { HyperListConfig } from 'hyperlist';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './songs-list.styles';
import template from './songs-list.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import {
  SongCategory,
  SongLanguage,
  SongMacroCategory,
  SongSummary,
} from '../../models/song';
import {
  getFormattedSongNumber,
  songCategoryToMacroCategoryMap,
  songLanguagesArray,
  songMacroCategoriesArray,
  songMacroCategoryToCategoriesMap,
} from '../../helpers/songs';

import type { OutlinedSelect } from '../../components/outlined-select/outlined-select.component';

import * as SongsListWorker from './songs-list.worker';

const { configureSearch, search } =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (SongsListWorker as any)() as typeof SongsListWorker;

@customElement('songs-list')
export class SongsList extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  private _hyperlist?: HyperList;

  private _displayedSongs: SongsListWorker.ExtendedSong[] = [];

  private _desktopLayout = false;

  private _songsPerRow = 1;

  @state()
  protected _songsStatus: APIResponse<SongSummary[]> = {
    loading: true,
    refreshing: false,
  };

  @state()
  protected _selectedLanguage = SongLanguage.ITALIAN;

  @state()
  protected _selectedCategory?: string;

  @state()
  protected _searchTerm = '';

  @state()
  protected _needSongsDownloadPermission = false;

  @state()
  protected _downloadingSongs = false;

  @state()
  protected _searching = false;

  @state()
  protected _filtersDialogOpen = false;

  @state()
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
    const supportedSongsLanguages = Object.values(SongLanguage);
    const supportedSongsCategories = Object.values(SongCategory);
    const [songsDownloadPreference, songsLanguage, songsCategory, locale] =
      await Promise.all([
        get<string>('songsDownloadPreference'),
        get<SongLanguage>('songsLanguage'),
        get<SongCategory>('songsCategory'),
        get<SupportedLocale>('locale'),
      ]);

    if (!songsDownloadPreference || songsDownloadPreference === 'no') {
      this._needSongsDownloadPermission = true;
    }

    this._selectedLanguage =
      songsLanguage && supportedSongsLanguages.includes(songsLanguage)
        ? songsLanguage
        : locale && supportedSongsLanguages.includes(locale as SongLanguage)
        ? (locale as SongLanguage)
        : SongLanguage.ITALIAN;

    this._selectedCategory =
      songsCategory && supportedSongsCategories.includes(songsCategory)
        ? songsCategory
        : undefined;

    for await (const status of cacheAndNetwork<SongSummary[]>(
      `${config.apiUrl}/songs${
        songsDownloadPreference === 'yes' ? '?fullData' : ''
      }`,
    )) {
      this._songsStatus = status;

      if (status.data) {
        await this._refreshSongs();
      }
    }
  }

  private async _refreshSongs() {
    const songs = (this._songsStatus.data || [])
      .filter(({ language, category }) => {
        if (language !== this._selectedLanguage) {
          return false;
        }

        if (!this._selectedCategory) {
          return true;
        }

        return songMacroCategoriesArray.includes(
          this._selectedCategory as SongMacroCategory,
        )
          ? // Filter by macro-category: include all categories belonging to that macro-category
            songMacroCategoryToCategoriesMap[
              this._selectedCategory as SongMacroCategory
            ].includes(category)
          : // Filter by category: only include songs belonging specifically to that category
            category === this._selectedCategory;
      })
      .sort((a, b) => {
        if (a.language !== b.language) {
          return (
            songLanguagesArray.indexOf(a.language) -
            songLanguagesArray.indexOf(b.language)
          );
        }

        // If the song language is italian, make sure the categories get properly sorted
        // Note that we already checked for language equality, so the two songs are in the same language.
        // For this reason, we don't need to check also for b.language
        if (a.language === SongLanguage.ITALIAN) {
          const categoriesDiff = songCategoryToMacroCategoryMap[
            a.category
          ].localeCompare(songCategoryToMacroCategoryMap[b.category]);
          if (categoriesDiff !== 0) {
            return categoriesDiff;
          }
        }

        // TODO: replace this with just a.number - b.number when migration is completed
        return a.number
          .toString()
          .padStart(5, '0')
          .localeCompare(b.number.toString().padStart(5, '0'));
      })
      .map((song) => ({
        ...song,
        formattedNumber: getFormattedSongNumber(song),
      })) as SongsListWorker.ExtendedSong[];

    await configureSearch(songs);

    this._displayedSongs = this._searchTerm
      ? await search(this._searchTerm)
      : songs;

    this._renderSongs();
  }

  private _getHyperListConfig(
    displayedSongs: SongsListWorker.ExtendedSong[],
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

        songs.forEach(
          ({ language, category, formattedNumber, number, title }) => {
            const anchor = document.createElement('a');
            anchor.href = this.localizeHref(
              'songs',
              language,
              category,
              number,
            );
            anchor.className = 'song';
            anchor.innerHTML = `
            <div class="book">
              <div class="number">
                ${formattedNumber}
              </div>
              <div class="title">${title}</div>
            </div>
            <div class="title">${title}</div>
          `;
            anchor.addEventListener(
              'click',
              async ({ altKey, ctrlKey, metaKey, shiftKey }) => {
                if (altKey || ctrlKey || metaKey || shiftKey) {
                  return;
                }

                this._searchInput!.value = '';
                this._searchTerm = '';
                this._stopSearching();
                await this._refreshSongs();
              },
            );

            container.appendChild(anchor);
          },
        );

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

  protected async _handleSearchKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape' || event.code === 'Enter') {
      event.preventDefault();

      if (event.code === 'Escape') {
        (event.target as HTMLInputElement).value = '';
        this._searchTerm = '';
        this._stopSearching();
        await this._refreshSongs();
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

  protected async _handleSearch({ target }: InputEvent) {
    this._searchTerm = (target as HTMLInputElement).value;
    history.replaceState(
      {},
      '',
      `${window.location.pathname}?search${
        this._searchTerm ? `=${this._searchTerm}` : ''
      }`,
    );

    this._songsContainer!.scrollTo(0, 0);
    await this._refreshSongs();
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

    this._selectedLanguage = newLanguage as SongLanguage;
    await this._refreshSongs();
  }

  protected async _handleCategoryFilter({ target }: CustomEvent<null>) {
    const newCategory = (target as OutlinedSelect).value;

    await set('songsCategory', newCategory);

    this._selectedCategory = newCategory;
    await this._refreshSongs();
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
