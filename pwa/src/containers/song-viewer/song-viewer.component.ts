import { PropertyValues } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
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
import { getFormattedSongNumber } from '../../helpers/songs';

const abcjsPromise = import('abcjs');

const _songsStatusesCache = new Map<string, APIResponse<Song>>();

@customElement('song-viewer')
export class SongViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public language?: string;

  @property({ type: String })
  public category?: string;

  @property({ type: String })
  public number?: string;

  @property({ type: Object })
  protected _songStatus: APIResponse<Song> = {
    loading: true,
    refreshing: false,
  };

  @queryAll('.abc')
  private _abcSections!: NodeListOf<HTMLDivElement>;

  private _previousPageTitle?: string;

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.active) {
      if (
        (changedProperties.has('language') ||
          changedProperties.has('category') ||
          changedProperties.has('number')) &&
        this.language &&
        this.category &&
        this.number
      ) {
        const songId = [this.language, this.category, this.number].join('/');
        if (!_songsStatusesCache.has(songId)) {
          for await (const status of cacheAndNetwork<Song>(
            `${config.apiUrl}/songs/${songId}`,
          )) {
            this._songStatus = status;

            if (status.data) {
              _songsStatusesCache.set(songId, status);

              const pageTitle = `Ancillapp - ${this.localize(
                t`songs`,
              )} - ${getFormattedSongNumber(status.data)}. ${
                status.data.title
              }`;

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
          this._songStatus = _songsStatusesCache.get(songId)!;
        }
      }
      if (changedProperties.has('_songStatus')) {
        const { renderAbc } = await abcjsPromise;
        this._abcSections.forEach((section) => {
          renderAbc(section, section.dataset.content!, {
            responsive: 'resize',
            dragColor: 'var(--ancillapp-primary-text-color)',
            selectionColor: 'var(--ancillapp-primary-text-color)',
            foregroundColor: 'var(--ancillapp-primary-text-color)',
          });
        });
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
