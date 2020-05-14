import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { BreviaryIndex } from './breviary-index.component';

import '@material/mwc-textfield';
import { Datepicker } from 'app-datepicker/dist/datepicker';
import { DatepickerDialog } from 'app-datepicker/dist/datepicker-dialog';

customElements.define('app-datepicker', Datepicker);
customElements.define('app-datepicker-dialog', DatepickerDialog);

export default function template(this: BreviaryIndex) {
  return html`
    <section>
      <mwc-textfield
        outlined
        readonly
        type="date"
        label="${this.localeData?.date}"
        value="${this._date}"
        @click="${this._handleTextfieldClick}"
      ></mwc-textfield>
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

    <app-datepicker-dialog
      clearLabel=""
      confirmLabel="${this.localeData?.set}"
      dismissLabel="${this.localeData?.cancel}"
      min="1900-01-01"
      max="2100-12-31"
      locale="${this.locale}"
    >
    </app-datepicker-dialog>
  `;
}
