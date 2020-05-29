import { html } from 'lit-element';
import { PrayerViewer } from './prayer-viewer.component';
import { compile } from '../../helpers/directives';
import { arrowBack, tau } from '../icons';

import '@material/mwc-snackbar';
import '../top-app-bar/top-app-bar.component';

export default function template(this: PrayerViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('prayers')}" slot="leadingIcon">
        <mwc-icon-button>${arrowBack}</mwc-icon-button>
      </a>
      <div slot="title">
        ${tau}
        ${this._prayerStatus.data?.title[this.locale] ||
        this._prayerStatus.data?.title.la ||
        this.localeData?.loading}
      </div>
    </top-app-bar>

    ${this._prayerStatus.loading || !this._prayerStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section>
            <h1>
              ${this._prayerStatus.data.title[this.locale] ||
              this._prayerStatus.data.title.la}
            </h1>
            ${compile(
              this._prayerStatus.data.content[this.locale] ||
                this._prayerStatus.data.content.la!,
            )}
          </section>
        `}

    <mwc-snackbar
      leading
      ?open="${this._prayerStatus.refreshing}"
      labelText="${this.localeData?.syncInProgress}"
    ></mwc-snackbar>
  `;
}
