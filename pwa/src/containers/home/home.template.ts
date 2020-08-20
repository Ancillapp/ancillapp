import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import {
  ancillasIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
  holyMassIcon,
  menu,
  arrowBack,
} from '../../components/icons';
import { HomePage } from './home.component';
import { t } from '@lingui/macro';

import '../../components/search-top-bar/search-top-bar.component';

export default function template(this: HomePage) {
  const searchResults = repeat(
    this._searchResults,
    ({ title }) => title,
    ({ link, preview, title, description }) => html`
      <a
        href="${link}"
        class="search-result"
        @click="${this._handleSearchResultClick}"
      >
        ${preview.type === 'text'
          ? html`
              <div class="search-result-preview">
                ${preview.content}
              </div>
            `
          : html`${unsafeHTML(preview.content)}`}
        <div class="search-result-content">
          <h4>${unsafeHTML(title)}</h4>
          ${description
            ? html`<h5>${unsafeHTML(description)}</h5>`
            : html`${nothing}`}
        </div>
      </a>
    `,
  );

  return html`
    <top-app-bar
      class="search-mode ${this.showMenuButton && this._searching
        ? ''
        : 'hidden'}"
      ?drawer-open="${this.drawerOpen}"
    >
      <mwc-icon-button slot="leadingIcon" @click="${this._stopSearching}">
        ${arrowBack}
      </mwc-icon-button>
      <input
        id="search-input"
        slot="title"
        placeholder="Cerca in Ancillapp"
        @keydown="${this._handleSearchKeyDown}"
        @input="${this._handleMobileSearch}"
        value="${this._searchTerm}"
        autofocus
      />
    </top-app-bar>
    <search-top-bar
      ?drawer-open="${this.drawerOpen}"
      placeholder="Cerca in Ancillapp"
      @search="${this._handleDesktopSearch}"
      @searchclick="${this._startSearching}"
      @searchkeydown="${this._handleSearchKeyDown}"
      class="${this.showMenuButton && this._searching ? 'hidden' : ''}"
    >
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${this.localize(t`home`)}
      </div>
    </search-top-bar>

    <div class="search-results" ?hidden="${!this._searching}">
      ${this._searchTerm && this._searchResults.length < 1
        ? html`<p>${this.localize(t`noResults`)}</p>`
        : html`${nothing}`}
      ${searchResults}
    </div>

    <section ?hidden="${this.showMenuButton && this._searching}">
      <h2>${this.localize(t`peaceAndGood`)}</h2>
      <ul>
        <li>
          <a href="${this.localizeHref('breviary')}">
            <span>${this.localize(t`prayLiturgy`)}</span>
            ${breviaryIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('songs')}">
            <span>${this.localize(t`singFraternitySongs`)}</span>
            ${songsIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('prayers')}">
            <span>${this.localize(t`prayDailyPrayers`)}</span>
            ${prayersIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('ancillas', 'latest')}">
            <span>${this.localize(t`readLatestAncilla`)}</span>
            ${ancillasIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('holy-mass')}">
            <span>${this.localize(t`bookHolyMassSeat`)}</span>
            ${holyMassIcon}
          </a>
        </li>
      </ul>
    </section>
  `;
}
