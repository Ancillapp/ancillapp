import { html } from 'lit-element';
import { DateInput } from './date-input.component';

import '@material/mwc-textfield';
import '@material/mwc-icon-button';

import { Datepicker } from 'app-datepicker/dist/datepicker';
import { DatepickerDialog } from 'app-datepicker/dist/datepicker-dialog';

customElements.define('app-datepicker', Datepicker);
customElements.define('app-datepicker-dialog', DatepickerDialog);

export default function template(this: DateInput) {
  return html`
    <mwc-textfield
      outlined
      readonly
      type="date"
      label="${this.label}"
      value="${this.value}"
      @click="${this._handleTextfieldClick}"
    ></mwc-textfield>

    <app-datepicker-dialog
      clearLabel=""
      confirmLabel="${this.setLabel}"
      dismissLabel="${this.cancelLabel}"
      min="${this.min}"
      max="${this.max}"
      locale="${this.locale}"
      @datepicker-dialog-closed="${this._handleDateChange}"
    >
    </app-datepicker-dialog>
  `;
}
