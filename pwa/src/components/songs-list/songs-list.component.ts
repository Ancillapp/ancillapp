import { customElement, property } from 'lit-element';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';
import Fuse from 'fuse.js';
import {
  staleWhileRevalidate,
  APIResponse,
} from '../../helpers/stale-while-revalidate';

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

  @property({ type: Object })
  protected _songsStatus: APIResponse<SongSummary[]> = {
    loading: true,
    refreshing: false,
  };

  @property({ type: String })
  protected _searchTerm = '';

  @property({ type: Array })
  protected _displayedSongs: SongSummary[] = [];

  @property({ type: Boolean })
  protected _needSongsDownloadPermission?: boolean;

  @property({ type: Boolean })
  protected _downloadingSongs?: boolean;

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

    for await (const status of staleWhileRevalidate<SongSummary[]>(
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
      }
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

    for await (const {
      loading,
      refreshing,
      data,
      error,
    } of staleWhileRevalidate<SongSummary[]>(`${apiUrl}/songs?fullData`)) {
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
