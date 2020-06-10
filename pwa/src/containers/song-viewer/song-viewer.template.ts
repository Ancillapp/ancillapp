import { html } from 'lit-element';
import { SongViewer } from './song-viewer.component';
import { compile } from '../../helpers/directives';
import { arrowBack, tau } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/share-fab/share-fab.component';

export default function template(this: SongViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('songs')}" slot="leadingIcon">
        <mwc-icon-button>${arrowBack}</mwc-icon-button>
      </a>
      <div slot="title">
        ${tau}
        ${this._songStatus.data
          ? `${this._songStatus.data.number.slice(2)}. ${
              this._songStatus.data.title
            }`
          : this.localize(t`loading`)}
      </div>
    </top-app-bar>

    ${this._songStatus.loading || !this._songStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section>
            ${compile(this._songStatus.data.content)}
          </section>

          <share-fab
            title="${this._songStatus.data.number.slice(2)}. ${this._songStatus
              .data.title}"
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
