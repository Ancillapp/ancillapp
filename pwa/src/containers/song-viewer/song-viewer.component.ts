import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { navigateTo } from '../../helpers/router';
import { PageViewElement } from '../page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './song-viewer.styles';
import template from './song-viewer.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { Song } from '../../models/song';

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

    if (this.active && changedProperties.has('song') && this.song) {
      if (!_songsStatusesCache.has(this.song)) {
        for await (const status of cacheAndNetwork<Song>(
          `${config.apiUrl}/songs/${this.song}`,
        )) {
          this._songStatus = status;

          if (status.data) {
            _songsStatusesCache.set(this.song, status);

            const pageTitle = `Ancillapp - ${this.localize(t`songs`)} - ${
              status.data.number
            }. ${status.data.title}`;

            if (pageTitle === this._previousPageTitle) {
              return;
            }

            this._previousPageTitle = pageTitle;

            const {
              data: { title },
            } = status;

            updateMetadata({
              title: pageTitle,
              description: this.localize(t`songDescription ${title}`),
            });

            logEvent('page_view', {
              page_title: pageTitle,
              page_location: window.location.href,
              page_path: window.location.pathname,
            });
          }
        }
      } else {
        this._songStatus = _songsStatusesCache.get(this.song)!;
      }
    }
  }

  protected _goToSearchPage() {
    navigateTo(`${this.localizeHref('songs')}?search`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'song-viewer': SongViewer;
  }
}
