import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { SongsList } from './songs-list.component';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '../search-input/search-input.component';
import '../unobtrusive-notification/unobtrusive-notification.component';
import '../loading-button/loading-button.component';

export default function template(this: SongsList) {
  return html`
    <unobtrusive-notification ?hidden="${!this._needSongsDownloadPermission}">
      ${this.localeData?.songsDownload}
      <mwc-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('never')}"
        ?disabled="${this._downloadingSongs}"
        label="${this.localeData?.dontAskAnymore}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('no')}"
        ?disabled="${this._downloadingSongs}"
        label="${this.localeData?.noThanks}"
        dense
      ></mwc-button>
      <loading-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('yes')}"
        ?loading="${this._downloadingSongs}"
        label="${this.localeData?.sure}"
        dense
      ></loading-button>
    </unobtrusive-notification>

    <div class="search-input-container">
      <search-input
        label="${this.localeData?.search}"
        @search="${this._handleSearch}"
      ></search-input>
    </div>

    <div class="songs-container">
      <div class="loading-container">
        <loading-spinner></loading-spinner>
      </div>
    </div>

    <mwc-snackbar
      leading
      ?open="${this._songsStatus.refreshing}"
      labelText="${this.localeData?.syncInProgress}"
    ></mwc-snackbar>
  `;
}
