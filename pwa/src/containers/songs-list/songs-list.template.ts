import { html } from 'lit';
import { SongsList } from './songs-list.component';
import {
  menu,
  search,
  arrowBack,
  dialpad,
  notes,
  filter,
} from '../../components/icons';
import { t } from '@lingui/macro';
import { SongCategory, SongLanguage } from '../../models/song';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';
import '../../components/loading-button/loading-button.component';
import '../../components/autosized-fab/autosized-fab.component';
import '../../components/outlined-select/outlined-select.component';

export default function template(this: SongsList) {
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
            <mwc-icon-button
              id="keyboard-type-switch"
              slot="trailingIcon"
              @click="${this._handleKeyboardTypeSwitch}"
              label="${this._numericOnly
                ? this.localize(t`switchToTextKeyboard`)
                : this.localize(t`switchToNumericKeyboard`)}"
            >
              ${this._numericOnly ? dialpad : notes}
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
        ${this.localize(t`songs`)}
      </div>
      <input
        id="search-input"
        type="search"
        slot="title"
        placeholder="${this.localize(t`search`)}"
        inputmode="${this._numericOnly ? 'numeric' : 'text'}"
        ?hidden="${!this._searching}"
        @keydown="${this._handleSearchKeyDown}"
        @input="${this._handleSearch}"
        value="${this._searchTerm}"
        autofocus
        aria-label="${this.localize(t`search`)}"
      />
    </top-app-bar>

    <unobtrusive-notification ?hidden="${!this._needSongsDownloadPermission}">
      ${this.localize(t`songsDownload`)}
      <mwc-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('never')}"
        ?disabled="${this._downloadingSongs}"
        label="${this.localize(t`dontAskAnymore`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('no')}"
        ?disabled="${this._downloadingSongs}"
        label="${this.localize(t`noThanks`)}"
        dense
      ></mwc-button>
      <loading-button
        slot="actions"
        @click="${() => this._updateSongsDownloadPermission('yes')}"
        ?loading="${this._downloadingSongs}"
        label="${this.localize(t`sure`)}"
        dense
      ></loading-button>
    </unobtrusive-notification>

    <div class="songs-container">
      <div class="loading-container">
        <loading-spinner></loading-spinner>
      </div>
    </div>

    <mwc-dialog
      heading="${this.localize(t`setFilters`)}"
      ?open="${this._filtersDialogOpen}"
      @closed="${() => (this._filtersDialogOpen = false)}"
    >
      <div>
        <ul class="settings">
          <li>
            <label for="language">${this.localize(t`language`)}</label>
            <outlined-select
              id="language"
              @change=${this._handleLanguageFilter}
              value="${this._selectedLanguage}"
            >
              <option value="${SongLanguage.ITALIAN}">
                ${this.localize(t`italian`)}
              </option>
              <option value="${SongLanguage.GERMAN}">
                ${this.localize(t`german`)}
              </option>
              <option value="${SongLanguage.PORTUGUESE}">
                ${this.localize(t`portuguese`)}
              </option>
            </outlined-select>
          </li>
          <li>
            <label for="category">${this.localize(t`category`)}</label>
            <outlined-select
              id="category"
              @change=${this._handleCategoryFilter}
              value="${this._selectedCategory}"
            >
              <option value="">-</option>
              <option value="${SongCategory.KYRIE}">
                ${this.localize(t`songCategoryKyrie`)}
              </option>
              <option value="${SongCategory.GLORY}">
                ${this.localize(t`songCategoryGlory`)}
              </option>
              <option value="${SongCategory.HALLELUJAH}">
                ${this.localize(t`songCategoryHallelujah`)}
              </option>
              <option value="${SongCategory.CREED}">
                ${this.localize(t`songCategoryCreed`)}
              </option>
              <option value="${SongCategory.OFFERTORY}">
                ${this.localize(t`songCategoryOffertory`)}
              </option>
              <option value="${SongCategory.HOLY}">
                ${this.localize(t`songCategoryHoly`)}
              </option>
              <option value="${SongCategory.ANAMNESIS}">
                ${this.localize(t`songCategoryAnamnesis`)}
              </option>
              <option value="${SongCategory.AMEN}">
                ${this.localize(t`songCategoryAmen`)}
              </option>
              <option value="${SongCategory.OUR_FATHER}">
                ${this.localize(t`songCategoryOurFather`)}
              </option>
              <option value="${SongCategory.LAMB_OF_GOD}">
                ${this.localize(t`songCategoryLambOfGod`)}
              </option>
              <option value="${SongCategory.CANONS_AND_REFRAINS}">
                ${this.localize(t`songCategoryCanonsAndRefrains`)}
              </option>
              <option value="${SongCategory.FRANCISCANS}">
                ${this.localize(t`songCategoryFranciscans`)}
              </option>
              <option value="${SongCategory.PRAISE_AND_FAREWELL}">
                ${this.localize(t`songCategoryPraiseAndFarewell`)}
              </option>
              <option value="${SongCategory.ENTRANCE}">
                ${this.localize(t`songCategoryEntrance`)}
              </option>
              <option value="${SongCategory.HOLY_SPIRIT}">
                ${this.localize(t`songCategoryHolySpirit`)}
              </option>
              <option value="${SongCategory.WORSHIP}">
                ${this.localize(t`songCategoryWorship`)}
              </option>
              <option value="${SongCategory.EUCHARIST}">
                ${this.localize(t`songCategoryEucharist`)}
              </option>
              <option value="${SongCategory.OTHER_SONGS}">
                ${this.localize(t`songCategoryOtherSongs`)}
              </option>
              <option value="${SongCategory.BENEDICTUS}">
                ${this.localize(t`songCategoryBenedictus`)}
              </option>
              <option value="${SongCategory.MAGNIFICAT}">
                ${this.localize(t`songCategoryMagnificat`)}
              </option>
              <option value="${SongCategory.CANTICLES}">
                ${this.localize(t`songCategoryCanticles`)}
              </option>
              <option value="${SongCategory.HYMNS}">
                ${this.localize(t`songCategoryHymns`)}
              </option>
              <option value="${SongCategory.SIMPLE_PRAYER}">
                ${this.localize(t`songCategorySimplePrayer`)}
              </option>
              <option value="${SongCategory.MARIANS}">
                ${this.localize(t`songCategoryMarians`)}
              </option>
              <option value="${SongCategory.ANIMATION}">
                ${this.localize(t`songCategoryAnimation`)}
              </option>
              <option value="${SongCategory.GREGORIANS}">
                ${this.localize(t`songCategoryGregorians`)}
              </option>
              <option value="${SongCategory.ADVENT}">
                ${this.localize(t`songCategoryAdvent`)}
              </option>
              <option value="${SongCategory.CHRISTMAS}">
                ${this.localize(t`songCategoryChristmas`)}
              </option>
              <option value="${SongCategory.LENT}">
                ${this.localize(t`songCategoryLent`)}
              </option>
            </outlined-select>
          </li>
        </ul>
      </div>
      <mwc-button dialogAction="close" slot="primaryAction">
        ${this.localize(t`close`)}
      </mwc-button>
    </mwc-dialog>

    <autosized-fab
      label="${this.localize(t`filters`)}"
      @click="${() => (this._filtersDialogOpen = true)}"
    >
      ${filter}
    </autosized-fab>

    <mwc-snackbar
      leading
      ?open="${this._songsStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
