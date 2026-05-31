import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { SongViewer } from './song-viewer.component';
import { renderSong } from '../../helpers/directives';
import { getFormattedSongNumber } from '../../helpers/songs';
import { t } from '@lingui/core/macro';

import '@material/mwc-snackbar';
import 'mdui/components/top-app-bar/top-app-bar.js';
import 'mdui/components/top-app-bar/top-app-bar-title.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/card.js';
import '../../components/ancillapp-icon.component.js';
import '../../components/share-fab/share-fab.component';
import('../../components/error-box/error-box.component');

export default function template(this: SongViewer) {
  return html`
    <mdui-top-app-bar
      scroll-behavior="hide"
      .scrollTarget="${this.scrollTarget}"
    >
      <mdui-button-icon
        @click="${this._goToSongsPage}"
        aria-label="${this.localize(t`back`)}"
      >
        <ancillapp-icon name="arrowBack"></ancillapp-icon>
      </mdui-button-icon>
      <mdui-top-app-bar-title>
        ${this._songStatus.data
          ? `${getFormattedSongNumber(this._songStatus.data)}. ${
              this._songStatus.data.title
            }`
          : this.localize(t`loading`)}
      </mdui-top-app-bar-title>
      <mdui-button-icon
        @click="${this._goToSearchPage}"
        aria-label="${this.localize(t`search`)}"
      >
        <ancillapp-icon name="search"></ancillapp-icon>
      </mdui-button-icon>
    </mdui-top-app-bar>

    ${when(
      this._songStatus.loading ||
        (this._songStatus.refreshing && !this._songStatus.data?.content),
      () => html`
        <div class="loading-container">
          <loading-spinner></loading-spinner>
        </div>
      `,
    )}
    ${when(
      this._songStatus.error && !this._songStatus.data?.content,
      () => html`
        <div class="error-container">
          <error-box .error="${this._songStatus.error!}"></error-box>
        </div>
      `,
    )}
    ${when(
      this._songStatus.data?.content,
      () => html`
        <mdui-card>${renderSong(this._songStatus.data!.content)}</mdui-card>

        <share-fab
          title="${this._songStatus.data!.number}. ${this._songStatus.data!
            .title}"
          text="${this.localize(t`shareSongText`)}"
          url="${window.location.href}"
        ></share-fab>
      `,
    )}

    <mwc-snackbar
      leading
      ?open="${this._songStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
