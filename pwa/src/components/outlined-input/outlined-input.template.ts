import { html } from 'lit';

import { OutlinedInput } from './outlined-input.component';

export default function template(this: OutlinedInput) {
  return html`
    <div class="${this._active ? 'active' : ''}">
      <label for="${this.inputId}">${this.label}</label>
      <input
        id="${this.inputId}"
        type="${this.type}"
        value="${this.value}"
        placeholder="${this.placeholder}"
        ?readonly="${this.readOnly}"
        @focus="${() => (this._active = true)}"
        @blur="${() => (this._active = false)}"
        @input="${(event: InputEvent) => {
          event.stopImmediatePropagation();
          this.value = (event.target as HTMLInputElement).value;
          this.dispatchEvent(
            new CustomEvent(event.type, {
              ...event,
              detail: this.value,
            }),
          );
        }}"
      />
    </div>
  `;
}
