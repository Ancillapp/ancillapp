import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { SongsList } from './songs-list.component';
import { load } from '../../helpers/directives';

import '@material/mwc-button';
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
    ${load(
      this._displayedSongs,
      (songs) => html`
        <div class="songs-container">
          ${songs.length > 0
            ? repeat(
                songs,
                ({ number }) => number,
                ({ number, title }) => html`
                  <a href="/songs/${number}" class="song">
                    <div class="number">
                      ${number.endsWith('bis')
                        ? `${number.slice(0, -3)}b`
                        : number}
                    </div>
                    <div class="title">${title}</div>
                  </a>
                `,
              )
            : html`<p>${this.localeData?.noResults}</p>`}
        </div>
      `,
      (error) => html`${error.message}`,
    )}
  `;
}
