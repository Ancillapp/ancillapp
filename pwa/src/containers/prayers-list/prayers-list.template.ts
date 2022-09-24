import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { PrayersList } from './prayers-list.component';
import { menu, search, arrowBack } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';
import '../../components/loading-button/loading-button.component';
import '../../components/autosized-fab/autosized-fab.component';
import { getPrayerDisplayedTitle } from '../../helpers/prayers';

export default function template(this: PrayersList) {
  return html`
    <top-app-bar
      class="${this._searching ? 'search-mode' : ''}"
      ?drawer-open="${this.drawerOpen}"
    >
      ${this._searching
        ? html`
            <mwc-icon-button
              slot="leadingIcon"
              @click="${this._stopSearching}"
              label="${this.localize(t`back`)}"
            >
              ${arrowBack}
            </mwc-icon-button>
          `
        : html`
            <mwc-icon-button
              slot="leadingIcon"
              ?hidden="${!this.showMenuButton}"
              @click="${() =>
                this.dispatchEvent(new CustomEvent('menutoggle'))}"
              label="${this.localize(t`menu`)}"
            >
              ${menu}
            </mwc-icon-button>
            <mwc-icon-button
              slot="trailingIcon"
              @click="${this._startSearching}"
              label="${this.localize(t`search`)}"
            >
              ${search}
            </mwc-icon-button>
          `}
      <div slot="title" ?hidden="${this._searching}">
        ${this.localize(t`prayers`)}
      </div>
      <input
        id="search-input"
        type="search"
        slot="title"
        placeholder="${this.localize(t`search`)}"
        ?hidden="${!this._searching}"
        @keydown="${this._handleSearchKeyDown}"
        @input="${this._handleSearch}"
        value="${this._searchTerm}"
        autofocus
        aria-label="${this.localize(t`search`)}"
      />
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
              (prayer) => html`
                <a
                  href="${this.localizeHref('prayers', prayer.slug)}"
                  class="prayer"
                  @click="${this._handlePrayerClick}"
                >
                  <div class="image">${unsafeHTML(prayer.image)}</div>
                  <div class="title">
                    ${getPrayerDisplayedTitle(
                      prayer,
                      this._userLanguagesPriorityArray,
                    )}
                  </div>
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
