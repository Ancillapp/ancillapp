import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../pages/page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';

import sharedStyles from '../shared.styles';
import styles from './song-viewer.styles';
import template from './song-viewer.template';

import { apiUrl } from '../../config/default.json';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

export interface Song {
  number: string;
  title: string;
  content: string;
}

const _songsStatusesCache = new Map<string, APIResponse<Song>>();

@customElement('song-viewer')
export class SongViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public song?: string;

  @property({ type: Object })
  protected _songStatus: APIResponse<Song> = {
    loading: true,
    refreshing: false,
  };

  private _previousPageTitle?: string;

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('song') && this.song) {
      if (!_songsStatusesCache.has(this.song)) {
        for await (const status of cacheAndNetwork<Song>(
          `${apiUrl}/songs/${
            /^\d/.test(this.song) ? `IT${this.song}` : this.song
          }`,
        )) {
          this._songStatus = status;

          if (status.data) {
            _songsStatusesCache.set(this.song, status);

            const pageTitle = `Ancillapp - ${
              this.localeData.songs
            } - ${status.data.number.slice(2)}. ${status.data.title}`;

            if (pageTitle === this._previousPageTitle) {
              return;
            }

            this._previousPageTitle = pageTitle;

            updateMetadata({
              title: pageTitle,
              description: this.localeData.songDescription(status.data.title),
            });

            analytics.logEvent('page_view', {
              page_title: pageTitle,
              page_location: window.location.href,
              page_path: window.location.pathname,
              offline: false,
            });
          }
        }
      } else {
        this._songStatus = _songsStatusesCache.get(this.song)!;
      }
    }
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (this.active && name === 'song' && value && old !== value) {
    }
    super.attributeChangedCallback(name, old, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'song-viewer': SongViewer;
  }
}
