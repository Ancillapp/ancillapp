import { html } from 'lit-element';
import { TopAppBar } from './top-app-bar.component';

export default function template(this: TopAppBar) {
  return html`
    <header
      class="${this._scrolled ? 'scrolled' : ''}"
      style="transform: translateY(${this._scrollFromTop}px)"
    >
      <div class="row">
        <section class="start">
          <slot name="leadingIcon"></slot>
          <div class="title">
            <slot name="title"></slot>
          </div>
        </section>
        <section class="end">
          <slot name="trailingIcon"></slot>
        </section>
      </div>
      <slot></slot>
    </header>
  `;
}
