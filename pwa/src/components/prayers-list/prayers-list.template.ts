import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { PrayersList } from './prayers-list.component';
import { load } from '../../helpers/directives';

import '@material/mwc-button';
import '../unobtrusive-notification/unobtrusive-notification.component';
import '../loading-button/loading-button.component';

export default function template(this: PrayersList) {
  return html`
    ${load(
      this._displayedPrayers,
      (prayers) => html`
        <unobtrusive-notification
          ?hidden="${!this._needPrayersDownloadPermission}"
        >
          ${this.localeData?.prayersDownload}
          <mwc-button
            slot="actions"
            @click="${() => this._updatePrayersDownloadPermission('never')}"
            ?disabled="${this._downloadingPrayers}"
            label="${this.localeData?.dontAskAnymore}"
            dense
          ></mwc-button>
          <mwc-button
            slot="actions"
            @click="${() => this._updatePrayersDownloadPermission('no')}"
            ?disabled="${this._downloadingPrayers}"
            label="${this.localeData?.noThanks}"
            dense
          ></mwc-button>
          <loading-button
            slot="actions"
            @click="${() => this._updatePrayersDownloadPermission('yes')}"
            ?loading="${this._downloadingPrayers}"
            label="${this.localeData?.sure}"
            dense
          ></loading-button>
        </unobtrusive-notification>

        <div class="prayers-container">
          ${prayers.length > 0
            ? repeat(
                prayers,
                ({ slug }) => slug,
                ({ slug, title, image }) => html`
                  <a href="/prayers/${slug}" class="prayer">
                    <div class="image">
                      ${unsafeHTML(image)}
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
