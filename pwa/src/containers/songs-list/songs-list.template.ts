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
import {
  SongCategory,
  SongLanguage,
  SongMacroCategory,
} from '../../models/song';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '@material/mwc-dialog';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';
import '../../components/loading-button/loading-button.component';
import '../../components/autosized-fab/autosized-fab.component';
import '../../components/outlined-select/outlined-select.component';

const indentOption = (option: string, width = 1) =>
  ' '.repeat(width * 6) + option;

const optionSeparator = html`<option disabled>━━━━━━━━━━</option>`;

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
              ${optionSeparator}
              <option value="${SongMacroCategory.ORDINARIUM_MISSAE}">
                ${SongMacroCategory.ORDINARIUM_MISSAE} -
                ${this.localize(t`songMacroCategoryOrdinariumMissae`)}
              </option>
              <option value="${SongCategory.KYRIE}">
                ${indentOption(this.localize(t`songCategoryKyrie`))}
              </option>
              <option value="${SongCategory.GLORY}">
                ${indentOption(this.localize(t`songCategoryGlory`))}
              </option>
              <option value="${SongCategory.HALLELUJAH}">
                ${indentOption(this.localize(t`songCategoryHallelujah`))}
              </option>
              <option value="${SongCategory.CREED}">
                ${indentOption(this.localize(t`songCategoryCreed`))}
              </option>
              <option value="${SongCategory.OFFERTORY}">
                ${indentOption(this.localize(t`songCategoryOffertory`))}
              </option>
              <option value="${SongCategory.HOLY}">
                ${indentOption(this.localize(t`songCategoryHoly`))}
              </option>
              <option value="${SongCategory.ANAMNESIS}">
                ${indentOption(this.localize(t`songCategoryAnamnesis`))}
              </option>
              <option value="${SongCategory.AMEN}">
                ${indentOption(this.localize(t`songCategoryAmen`))}
              </option>
              <option value="${SongCategory.OUR_FATHER}">
                ${indentOption(this.localize(t`songCategoryOurFather`))}
              </option>
              <option value="${SongCategory.LAMB_OF_GOD}">
                ${indentOption(this.localize(t`songCategoryLambOfGod`))}
              </option>
              ${optionSeparator}
              <option value="${SongMacroCategory.SONGS}">
                ${SongMacroCategory.SONGS} -
                ${this.localize(t`songMacroCategorySongs`)}
              </option>
              <option value="${SongCategory.FRANCISCANS}">
                ${indentOption(this.localize(t`songCategoryFranciscans`))}
              </option>
              <option value="${SongCategory.PRAISE_AND_FAREWELL}">
                ${indentOption(this.localize(t`songCategoryPraiseAndFarewell`))}
              </option>
              <option value="${SongCategory.ENTRANCE}">
                ${indentOption(this.localize(t`songCategoryEntrance`))}
              </option>
              <option value="${SongCategory.HOLY_SPIRIT}">
                ${indentOption(this.localize(t`songCategoryHolySpirit`))}
              </option>
              <option value="${SongCategory.WORSHIP}">
                ${indentOption(this.localize(t`songCategoryWorship`))}
              </option>
              <option value="${SongCategory.EUCHARIST}">
                ${indentOption(this.localize(t`songCategoryEucharist`))}
              </option>
              <option value="${SongCategory.SIMPLE_PRAYER}">
                ${indentOption(this.localize(t`songCategorySimplePrayer`))}
              </option>
              <option value="${SongCategory.MARIANS}">
                ${indentOption(this.localize(t`songCategoryMarians`))}
              </option>
              <option value="${SongCategory.OTHER_SONGS}">
                ${indentOption(this.localize(t`songCategoryOtherSongs`))}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.ANIMATION}">
                ${SongMacroCategory.ANIMATION} -
                ${this.localize(t`songCategoryAnimation`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.ADVENT}">
                ${SongMacroCategory.ADVENT} -
                ${this.localize(t`songCategoryAdvent`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.CHRISTMAS}">
                ${SongMacroCategory.CHRISTMAS} -
                ${this.localize(t`songCategoryChristmas`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.LENT}">
                ${SongMacroCategory.LENT} -
                ${this.localize(t`songCategoryLent`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.HYMNS}">
                ${SongMacroCategory.HYMNS} -
                ${this.localize(t`songCategoryHymns`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.GREGORIANS}">
                ${SongMacroCategory.GREGORIANS} -
                ${this.localize(t`songCategoryGregorians`)}
              </option>
              ${optionSeparator}
              <option value="${SongCategory.CANONS_AND_REFRAINS}">
                ${SongMacroCategory.CANONS_AND_REFRAINS} -
                ${this.localize(t`songCategoryCanonsAndRefrains`)}
              </option>
              ${optionSeparator}
              <option value="${SongMacroCategory.LITURGY_OF_THE_HOURS}">
                ${SongMacroCategory.LITURGY_OF_THE_HOURS} -
                ${this.localize(t`songMacroCategoryLiturgyOfTheHours`)}
              </option>
              <option value="${SongCategory.VENI_CREATOR}">
                ${indentOption(this.localize(t`songCategoryVeniCreator`))}
              </option>
              <option value="${SongCategory.BENEDICTUS}">
                ${indentOption(this.localize(t`songCategoryBenedictus`))}
              </option>
              <option value="${SongCategory.MAGNIFICAT}">
                ${indentOption(this.localize(t`songCategoryMagnificat`))}
              </option>
              <option value="${SongCategory.CANTICLES}">
                ${indentOption(this.localize(t`songCategoryCanticles`))}
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
