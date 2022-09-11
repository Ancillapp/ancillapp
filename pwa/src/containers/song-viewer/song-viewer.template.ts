import { html } from 'lit';
import { SongViewer } from './song-viewer.component';
import { renderSong } from '../../helpers/directives';
import { arrowBack, search } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/share-fab/share-fab.component';

export default function template(this: SongViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('songs')}" slot="leadingIcon">
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">
        ${this._songStatus.data
          ? `${this._songStatus.data.number}. ${this._songStatus.data.title}`
          : this.localize(t`loading`)}
      </div>
      <mwc-icon-button
        slot="trailingIcon"
        @click="${this._goToSearchPage}"
        label="${this.localize(t`search`)}"
      >
        ${search}
      </mwc-icon-button>
    </top-app-bar>

    ${this._songStatus.loading || !this._songStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section>${renderSong(this._songStatus.data.content)}</section>

          <share-fab
            title="${this._songStatus.data.number}. ${this._songStatus.data
              .title}"
            text="${this.localize(t`shareSongText`)}"
            url="${window.location.href}"
          ></share-fab>
        `}

    <mwc-snackbar
      leading
      ?open="${this._songStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
