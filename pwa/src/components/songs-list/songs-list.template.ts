import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { SongsList } from './songs-list.component';
import { load } from '../../helpers/directives';

import '../search-input/search-input.component';

export default function template(this: SongsList) {
  return html`
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
