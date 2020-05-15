import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { SongsList } from './songs-list.component';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '../search-input/search-input.component';
import '../unobtrusive-notification/unobtrusive-notification.component';
import '../loading-button/loading-button.component';
import '../autosized-fab/autosized-fab.component';
import '../outlined-select/outlined-select.component';

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

    <mwc-dialog
      heading="${this.localeData?.setFilters}"
      ?open="${this._filtersDialogOpen}"
      @closed="${() => (this._filtersDialogOpen = false)}"
    >
      <div>
        <ul class="settings">
          <li>
            <label for="language">${this.localeData?.language}</label>
            <outlined-select
              id="language"
              @change=${this._handleLanguageFilter}
              value="${this._selectedLanguage}"
            >
              <option value="it">${this.localeData?.italian}</option>
              <option value="de">${this.localeData?.german}</option>
            </outlined-select>
          </li>
        </ul>
      </div>
      <mwc-button dialogAction="close" slot="primaryAction">
        ${this.localeData?.close}
      </mwc-button>
    </mwc-dialog>

    <autosized-fab
      label="${this.localeData?.share}"
      icon="filter"
      @click="${() => (this._filtersDialogOpen = true)}"
    >
    </autosized-fab>

    <mwc-snackbar
      leading
      ?open="${this._songsStatus.refreshing}"
      labelText="${this.localeData?.syncInProgress}"
    ></mwc-snackbar>
  `;
}
