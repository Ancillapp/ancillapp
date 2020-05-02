import { customElement, property } from 'lit-element';
import { get, set } from '../../helpers/keyval';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';
import Fuse from 'fuse.js';

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

  protected _songs: Promise<SongSummary[]> = get<string>(
    'songsDownloadPreference',
  )
    .then((songsDownloadPreference) =>
      fetch(
        `${apiUrl}/songs${
          songsDownloadPreference === 'yes' ? '?fullData' : ''
        }`,
      ),
    )
    .then((res) => res.json());

  private _fuse = this._songs.then(
    (songs) =>
      new Fuse(songs, {
        keys: ['number', 'title'],
      }),
  );

  @property({ type: String })
  protected _searchTerm = '';

  @property({ type: Object })
  protected _displayedSongs: Promise<SongSummary[]> = this._songs;

  @property({ type: Boolean })
  protected _needSongsDownloadPermission?: boolean;

  @property({ type: Boolean })
  protected _downloadingSongs?: boolean;

  constructor() {
    super();

    get<string>('songsDownloadPreference').then((songsDownloadPreference) => {
      if (!songsDownloadPreference || songsDownloadPreference === 'no') {
        this._needSongsDownloadPermission = true;
      }
    });
  }

  protected _handleSearch({ detail }: CustomEvent<string>) {
    this._displayedSongs = detail
      ? this._fuse.then((fuse) => fuse.search(detail).map(({ item }) => item))
      : this._songs;
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

    try {
      const res = await fetch(`${apiUrl}/songs?fullData`);
      await res.json();
      await set('songsDownloadPreference', 'yes');
      this._needSongsDownloadPermission = false;
    } catch {}

    this._downloadingSongs = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'songs-list': SongsList;
  }
}
