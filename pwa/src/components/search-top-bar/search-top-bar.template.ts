import { html } from 'lit-element';
import { SearchTopBar } from './search-top-bar.component';

export default function template(this: SearchTopBar) {
  return html`
    <header style="transform: translateY(${this._scrollFromTop}px)">
      <div class="row">
        <section class="start">
          <slot name="leadingIcon"></slot>
        </section>
        <input
          placeholder="${this.placeholder}"
          @input="${this._handleSearch}"
          @click="${this._handleSearchClick}"
        />
        <section class="end">
          <slot name="trailingIcon"></slot>
        </section>
      </div>
    </header>
  `;
}
