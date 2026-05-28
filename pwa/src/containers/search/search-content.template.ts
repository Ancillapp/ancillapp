import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { SearchContent } from './search-content.component';
import { t } from '@lingui/core/macro';

import 'mdui/components/text-field.js';
import '../../components/ancillapp-icon.component.js';

export default function template(this: SearchContent) {
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
    <mdui-text-field
      class="search-field"
      type="search"
      variant="filled"
      placeholder="${this.localize(t`searchInAncillapp`)}"
      icon="search"
      .value="${this._searchTerm}"
      @input="${this._handleSearch}"
      @keydown="${this._handleSearchKeyDown}"
      aria-label="${this.localize(t`searchInAncillapp`)}"
    >
      <ancillapp-icon name="search" slot="icon"></ancillapp-icon>
    </mdui-text-field>

    <div class="search-results">
      ${this._searching && this._searchTerm && this._searchResults.length < 1
        ? html`<p>${this.localize(t`noResults`)}</p>`
        : nothing}
      ${this._searching ? searchResults : nothing}
    </div>
  `;
}
