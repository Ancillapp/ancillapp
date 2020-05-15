import { customElement, property, query, PropertyValues } from 'lit-element';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';
import Fuse from 'fuse.js';
import HyperList, { HyperListConfig } from 'hyperlist';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';

import sharedStyles from '../shared.styles';
import styles from './songs-list.styles';
import template from './songs-list.template';

import { apiUrl } from '../../config/default.json';

export interface SongSummary {
  number: string;
  title: string;
}

@customElement('songs-list')
export class SongsList extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  private _fuse?: Fuse<SongSummary, { keys: ['number', 'title'] }>;

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
  protected _searchTerm = '';

  @property({ type: Boolean })
  protected _needSongsDownloadPermission?: boolean;

  @property({ type: Boolean })
  protected _downloadingSongs?: boolean;

  @query('.songs-container')
  private _songsContainer?: HTMLDivElement;

  constructor() {
    super();

    this._prepareSongs();
  }

  private async _prepareSongs() {
    const songsDownloadPreference = await get<string>(
      'songsDownloadPreference',
    );

    if (!songsDownloadPreference || songsDownloadPreference === 'no') {
      this._needSongsDownloadPermission = true;
    }

    for await (const status of cacheAndNetwork<SongSummary[]>(
      `${apiUrl}/songs${songsDownloadPreference === 'yes' ? '?fullData' : ''}`,
    )) {
      this._songsStatus = status;

      if (status.data) {
        if (!this._fuse) {
          this._fuse = new Fuse(status.data, {
            keys: ['number', 'title'],
          });
        }

        this._displayedSongs = this._searchTerm
          ? this._fuse.search(this._searchTerm).map(({ item }) => item)
          : status.data;

        this._updateSongsList();
      }
    }
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

        container.innerHTML = songs.reduce(
          (html, { number, title }) => `
              ${html}
              <a href="/songs/${number}" class="song">
                <div class="book">
                  <div class="number">
                    ${
                      number.endsWith('bis')
                        ? `${number.slice(0, -3)}b`
                        : number
                    }
                  </div>
                  <div class="title">${title}</div>
                </div>
                <div class="title">${title}</div>
              </a>
            `,
          '',
        );

        return container;
      },
    };
  }

  private _updateSongsList() {
    if (this._displayedSongs.length < 1) {
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

        this._updateSongsList();
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

  protected _handleSearch({ detail: searchTerm }: CustomEvent<string>) {
    this._searchTerm = searchTerm;

    const songs = this._songsStatus.data || [];

    if (!this._fuse) {
      this._fuse = new Fuse(songs, {
        keys: ['number', 'title'],
      });
    }

    this._displayedSongs = this._searchTerm
      ? this._fuse.search(this._searchTerm).map(({ item }) => item)
      : songs;

    this._updateSongsList();
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

    for await (const { loading, refreshing, data, error } of cacheAndNetwork<
      SongSummary[]
    >(`${apiUrl}/songs?fullData`)) {
      if (!loading && !refreshing && data && !error) {
        await set('songsDownloadPreference', 'yes');
        this._needSongsDownloadPermission = false;
      }
    }

    this._downloadingSongs = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'songs-list': SongsList;
  }
}
