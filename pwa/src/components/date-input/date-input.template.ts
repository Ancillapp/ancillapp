import { html } from 'lit';
import { DateInput } from './date-input.component';

import '../outlined-input/outlined-input.component';
import '@material/mwc-icon-button';

export default function template(this: DateInput) {
  return html`
    <outlined-input
      readonly
      type="date"
      label="${this.label}"
      value="${this.value}"
      min="${this.min}"
      max="${this.max}"
      @change="${this._handleDateChange}"
    ></outlined-input>
  `;
}
