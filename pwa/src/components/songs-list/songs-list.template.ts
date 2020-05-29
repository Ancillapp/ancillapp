import { html } from 'lit-element';
import { SongsList } from './songs-list.component';
import { menu, tau, search, arrowBack, dialpad, notes } from '../icons';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '../top-app-bar/top-app-bar.component';
import '../unobtrusive-notification/unobtrusive-notification.component';
import '../loading-button/loading-button.component';
import '../autosized-fab/autosized-fab.component';
import '../outlined-select/outlined-select.component';

export default function template(this: SongsList) {
  return html`
    <top-app-bar
      class="${this._searching ? 'search-mode' : ''}"
      ?drawer-open="${this.drawerOpen}"
    >
      ${this._searching
        ? html`
            <mwc-icon-button
              slot="leadingIcon"
              @click="${() => (this._searching = false)}"
            >
              ${arrowBack}
            </mwc-icon-button>
            <mwc-icon-button
              id="keyboard-type-switch"
              slot="trailingIcon"
              @click="${this._handleKeyboardTypeSwitch}"
            >
              ${this._numericOnly ? dialpad : notes}
            </mwc-icon-button>
          `
        : html`
            <mwc-icon-button
              slot="leadingIcon"
              @click="${() =>
                this.dispatchEvent(new CustomEvent('menutoggle'))}"
            >
              ${menu}
            </mwc-icon-button>
            <mwc-icon-button
              slot="trailingIcon"
              @click="${() => (this._searching = true)}"
            >
              ${search}
            </mwc-icon-button>
          `}
      <div slot="title" ?hidden="${this._searching}">
        ${tau} ${this.localeData?.songs}
      </div>
      <input
        id="search-input"
        slot="title"
        placeholder="${this.localeData.search}"
        ?hidden="${!this._searching}"
        @keydown="${this._handleSearchKeyDown}"
        @input="${this._handleSearch}"
      />
    </top-app-bar>

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
