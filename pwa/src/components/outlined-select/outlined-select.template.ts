import { html } from 'lit';
import { OutlinedSelect } from './outlined-select.component';

import { dropDown, dropUp } from '../icons';

export default function template(this: OutlinedSelect) {
  return html`
    <select
      id="${this.selectId}"
      @focus="${() => (this._active = true)}"
      @blur="${() => (this._active = false)}"
      @change="${(event: Event) => {
        event.stopPropagation();
        this._active = false;
        this.value = (event.target as HTMLSelectElement).value;
        this.dispatchEvent(new CustomEvent(event.type, event));
      }}"
      class="${this._active ? 'active' : ''}"
    ></select>
    ${this._active ? dropUp : dropDown}
    <slot></slot>
  `;
}
