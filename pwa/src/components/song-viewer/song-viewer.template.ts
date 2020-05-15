import { html } from 'lit-element';
import { SongViewer } from './song-viewer.component';
import { compile } from '../../helpers/directives';

import '@material/mwc-snackbar';
import '../share-button/share-button.component';

export default function template(this: SongViewer) {
  return html`
    ${this._songStatus.loading || !this._songStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section>
            <h1>
              ${this._songStatus.data.number}. ${this._songStatus.data.title}
            </h1>
            ${compile(this._songStatus.data.content)}
          </section>

          <share-button
            title="${this._songStatus.data.number}. ${this._songStatus.data
              .title}"
            text="${this.localeData?.shareSongText}"
            url="${window.location.href}"
          ></share-button>
        `}

    <mwc-snackbar
      leading
      ?open="${this._songStatus.refreshing}"
      labelText="${this.localeData?.syncInProgress}"
    ></mwc-snackbar>
  `;
}
