import { html } from 'lit';
import { TopAppBar } from './top-app-bar.component';

const getHeaderDynamicStyles = (
  scrollFromTop: number,
  textColor: string | undefined,
  backgroundColor: string | undefined,
) =>
  [
    `transform: translateY(${scrollFromTop}px);`,
    ...(textColor ? [`color: ${textColor};`] : []),
    ...(backgroundColor ? [`background: ${backgroundColor};`] : []),
  ].join('');

export default function template(this: TopAppBar) {
  return html`
    <header
      class="${this._scrolled ? 'scrolled' : ''}"
      style="${getHeaderDynamicStyles(
        this._scrollFromTop,
        this.textColor,
        this.backgroundColor,
      )}"
    >
      <div class="row">
        <section class="start">
          <slot name="leadingIcon"></slot>
          <div
            class="title"
            style="${this.textColor ? `color: ${this.textColor};` : ''}"
          >
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
