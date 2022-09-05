import { html } from 'lit';
import { SearchTopBar } from './search-top-bar.component';

export default function template(this: SearchTopBar) {
  return html`
    <header style="transform: translateY(${this._scrollFromTop}px)">
      <div class="row">
        <section class="start">
          <slot name="leadingIcon"></slot>
        </section>
        <input
          type="search"
          placeholder="${this.placeholder}"
          @input="${this._handleSearch}"
          @click="${this._handleSearchClick}"
          @keydown="${this._handleSearchKeyDown}"
          aria-label="${this.placeholder}"
        />
        <section class="end">
          <slot name="trailingIcon"></slot>
        </section>
      </div>
    </header>
  `;
}
