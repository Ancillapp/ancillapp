import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { BreviaryIndex } from './breviary-index.component';

import '@material/mwc-textfield';
import 'app-datepicker/dist/app-datepicker-dialog';

export default function template(this: BreviaryIndex) {
  return html`
    <section>
      <mwc-textfield
        outlined
        required
        type="date"
        label="${this.localeData?.date}"
        @click="${this._handleTextfieldClick}"
        value="${this._date}"
      ></mwc-textfield>
      <app-datepicker-dialog
        clearLabel=""
        confirmLabel="${this.localeData?.set}"
        dismissLabel="${this.localeData?.cancel}"
        min="1900-01-01"
        max="2100-12-31"
        locale="${this.locale}"
        @datepicker-dialog-closed="${this._handleDateChange}"
      >
      </app-datepicker-dialog>
      ${until(
        this._titlePromise,
        html`<h2>${this.localeData?.loading.toUpperCase()}</h2>`,
      )}
      <ul>
        ${[
          'invitatory',
          'office',
          'lauds',
          'terce',
          'sext',
          'none',
          'vespers',
          'compline',
        ].map(
          (prayer) => html`
            <li>
              <a href="/breviary/${prayer}/${this._date}">
                <span>${this.localeData?.[prayer]}</span>
              </a>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}
