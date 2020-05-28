import { html } from 'lit-element';
import { TopAppBar } from './top-app-bar.component';

import '@material/mwc-fab';

export default function template(this: TopAppBar) {
  return html`
    <header style="transform: translateY(${this._scrollFromTop}px)">
      <div class="row">
        <section class="start">
          <slot name="leadingIcon"></slot>
          <span class="title">
            <slot name="title"></slot>
          </span>
        </section>
        <section class="end">
          <slot name="trailingIcon"></slot>
        </section>
      </div>
    </header>
  `;
}
