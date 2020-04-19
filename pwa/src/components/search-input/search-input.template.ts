import { html } from 'lit-element';
import { SearchInput } from './search-input.component';

import '@material/mwc-textfield';
import '@material/mwc-icon-button';

export default function template(this: SearchInput) {
  return html`
    <mwc-textfield
      outlined
      label="${this.label}"
      @input="${this._handleSearch}"
      inputmode="${this._numericOnly ? 'numeric' : 'text'}"
    ></mwc-textfield>
    <mwc-icon-button
      icon="${this._numericOnly ? 'dialpad' : 'notes'}"
      @click="${this._handleKeyboardTypeSwitch}"
    ></mwc-icon-button>
  `;
}
