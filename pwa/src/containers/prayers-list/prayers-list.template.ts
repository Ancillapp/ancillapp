import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { PrayersList } from './prayers-list.component';
import { menu, tau } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';
import '../../components/loading-button/loading-button.component';

export default function template(this: PrayersList) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${tau} ${this.localize(t`prayers`)}
      </div>
    </top-app-bar>

    <unobtrusive-notification ?hidden="${!this._needPrayersDownloadPermission}">
      ${this.localize(t`prayersDownload`)}
      <mwc-button
        slot="actions"
        @click="${() => this._updatePrayersDownloadPermission('never')}"
        ?disabled="${this._downloadingPrayers}"
        label="${this.localize(t`dontAskAnymore`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updatePrayersDownloadPermission('no')}"
        ?disabled="${this._downloadingPrayers}"
        label="${this.localize(t`noThanks`)}"
        dense
      ></mwc-button>
      <loading-button
        slot="actions"
        @click="${() => this._updatePrayersDownloadPermission('yes')}"
        ?loading="${this._downloadingPrayers}"
        label="${this.localize(t`sure`)}"
        dense
      ></loading-button>
    </unobtrusive-notification>

    ${this._prayersStatus.loading || !this._prayersStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <div class="prayers-container">
            ${this._prayersStatus.data.length < 1
              ? html`<p>${this.localize(t`noResults`)}</p>`
              : html`${nothing}`}
            ${repeat(
              this._displayedPrayers,
              ({ slug }) => slug,
              ({
                slug,
                title: { [this.locale]: localizedTitle, la: latinTitle },
                image,
              }) => html`
                <a href="${this.localizeHref('prayers', slug)}" class="prayer">
                  <div class="image">
                    ${unsafeHTML(image)}
                  </div>
                  <div class="title">${localizedTitle || latinTitle}</div>
                </a>
              `,
            )}
          </div>
        `}

    <mwc-snackbar
      leading
      ?open="${this._prayersStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
