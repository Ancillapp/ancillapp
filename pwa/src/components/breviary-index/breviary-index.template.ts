import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { BreviaryIndex } from './breviary-index.component';

import '@material/mwc-textfield';
import '../date-input/date-input.component';

export default function template(this: BreviaryIndex) {
  return html`
    <section>
      <date-input
        label="${this.localeData?.date}"
        set-label="${this.localeData?.set}"
        cancel-label="${this.localeData?.cancel}"
        value="${this._date}"
        @change="${this._handleDateChange}"
      ></date-input>
      ${until(
        this._titlePromise,
        html`<h2>${this.localeData?.loading.toUpperCase()}</h2>`,
      )}
      <ul>
        ${[
          'invitatory',
          'matins',
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
