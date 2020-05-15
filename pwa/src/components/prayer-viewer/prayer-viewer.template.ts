import { html } from 'lit-element';
import { PrayerViewer } from './prayer-viewer.component';
import { compile } from '../../helpers/directives';

import '@material/mwc-snackbar';

export default function template(this: PrayerViewer) {
  return html`
    ${this._prayerStatus.loading || !this._prayerStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section>
            <h1>${this._prayerStatus.data.title.it}</h1>
            ${compile(this._prayerStatus.data.content.it)}
          </section>
        `}

    <mwc-snackbar
      leading
      ?open="${this._prayerStatus.refreshing}"
      labelText="${this.localeData?.syncInProgress}"
    ></mwc-snackbar>
  `;
}
