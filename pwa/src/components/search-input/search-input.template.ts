import { html } from 'lit-element';
import { SearchInput } from './search-input.component';

import '@material/mwc-textfield';

export default function template(this: SearchInput) {
  return html`
    <mwc-textfield
      outlined
      label="${this.label}"
      @input="${this._handleSearch}"
    ></mwc-textfield>
  `;
}
