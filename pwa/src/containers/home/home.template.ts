import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  magazinesIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
  holyMassIcon,
  tau,
} from '../../components/icons.js';
import { formatDateToUrl } from '../../helpers/utils';
import { HomePage } from './home.component';
import { t } from '@lingui/core/macro';

import 'mdui/components/card.js';
import 'mdui/components/text-field.js';
import '../../components/ancillapp-icon.component.js';

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
          ? html`<div class="search-result-preview">${preview.content}</div>`
          : html`${unsafeHTML(preview.content)}`}
        <div class="search-result-content">
          <h4>${unsafeHTML(title)}</h4>
          ${description ? html`<h5>${unsafeHTML(description)}</h5>` : nothing}
        </div>
      </a>
    `,
  );

  return html`
    <div class="app-header">
      ${tau}
      <span>Ancillapp</span>
    </div>

    <div class="hero">
      <div class="hero-content">
        <h1>${this.localize(t`peaceAndGood`)}</h1>
        <p class="hero-subtitle">${this._todaySubtitle}</p>
      </div>
      <div class="hero-watermark" aria-hidden="true">${tau}</div>
    </div>

    <mdui-text-field
      class="search-field"
      type="search"
      variant="filled"
      placeholder="${this.localize(t`searchInAncillapp`)}"
      icon="search"
      .value="${this._searchTerm}"
      @input="${this._handleMobileSearch}"
      @keydown="${this._handleSearchKeyDown}"
      aria-label="${this.localize(t`searchInAncillapp`)}"
    >
      <ancillapp-icon name="searchIcon" slot="icon"></ancillapp-icon>
    </mdui-text-field>

    <div class="search-results" ?hidden="${!this._searching}">
      ${this._searchTerm && this._searchResults.length < 1
        ? html`<p>${this.localize(t`noResults`)}</p>`
        : nothing}
      ${searchResults}
    </div>

    <section ?hidden="${this._searching}">
      <h2 class="section-label">${this.localize(t`forToday`)}</h2>
      <div class="nav-grid">
        <!-- TODO -->
        <!-- <mdui-card
          clickable
          href="${this.localizeHref('breviary')}"
          class="nav-card card-breviary"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label">${this.localize(t`prayLiturgy`)}</span>
            <div class="nav-card-icon">${breviaryIcon}</div>
          </div>
        </mdui-card> -->

        <mdui-card
          clickable
          href="${this.localizeHref('songs')}"
          class="nav-card card-songs"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`singFraternitySongs`)}</span
            >
            <div class="nav-card-icon">${songsIcon}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('prayers')}"
          class="nav-card card-prayers"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`prayDailyPrayers`)}</span
            >
            <div class="nav-card-icon">${prayersIcon}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('holy-mass')}/${formatDateToUrl(
            new Date(),
          )}"
          class="nav-card card-holy-mass"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`readLiturgyOfTheDay`)}</span
            >
            <div class="nav-card-icon">${holyMassIcon}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('magazines')}"
          class="nav-card card-magazines"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`readFraternityMagazines`)}</span
            >
            <div class="nav-card-icon">${magazinesIcon}</div>
          </div>
        </mdui-card>
      </div>
    </section>
  `;
}
