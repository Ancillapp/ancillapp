import { html } from 'lit';
import { DateInput } from './date-input.component';

import '../outlined-input/outlined-input.component';
import '@material/mwc-icon-button';
import { toLocalTimeZone } from '../../helpers/utils';

export default function template(this: DateInput) {
  return html`
    <outlined-input
      type="date"
      label="${this.label}"
      value="${this.value
        ? toLocalTimeZone(this.value).toISOString().slice(0, 10)
        : null}"
      min="${this.min}"
      max="${this.max}"
      @input="${this._handleDateChange}"
    ></outlined-input>
  `;
}
