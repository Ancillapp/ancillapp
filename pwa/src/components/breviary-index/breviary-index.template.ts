import { html } from 'lit-element';
import { BreviaryIndex } from './breviary-index.component';

import '@material/mwc-textfield';

export default function template(this: BreviaryIndex) {
  return html`
    <section>
      <mwc-textfield
        outlined
        required
        type="date"
        label="${this.localeData?.date}"
        @input="${this._handleDateChange}"
        value="${this._date}"
      ></mwc-textfield>
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
