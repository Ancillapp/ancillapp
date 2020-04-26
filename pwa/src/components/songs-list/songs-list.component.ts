import { customElement, property } from 'lit-element';
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

  protected _songs: Promise<SongSummary[]> = fetch(
    `${apiUrl}/songs`,
  ).then((res) => res.json());

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

  protected render = template;

  protected _handleSearch({ detail }: CustomEvent<string>) {
    this._displayedSongs = detail
      ? this._fuse.then((fuse) => fuse.search(detail).map(({ item }) => item))
      : this._songs;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'songs-list': SongsList;
  }
}
