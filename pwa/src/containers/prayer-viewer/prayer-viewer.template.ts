import { html } from 'lit-element';
import { PrayerViewer } from './prayer-viewer.component';
import { compile } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';

export default function template(this: PrayerViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('prayers')}" slot="leadingIcon">
        <mwc-icon-button>${arrowBack}</mwc-icon-button>
      </a>
      <div slot="title">
        ${this._prayerStatus.data?.title[this.locale] ||
        this._prayerStatus.data?.title.la ||
        this.localize(t`loading`)}
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
            ${compile(
              this._prayerStatus.data.content[this.locale] ||
                this._prayerStatus.data.content.la!,
            )}
          </section>
        `}

    <mwc-snackbar
      leading
      ?open="${this._prayerStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
