import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { BreviaryIndex } from './breviary-index.component';
import { menu, tau } from '../icons';

import '@material/mwc-textfield';
import '../date-input/date-input.component';

export default function template(this: BreviaryIndex) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${tau} ${this.localeData?.breviary}
      </div>
    </top-app-bar>

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
              <a href="${this.localizeHref('breviary', prayer, this._date)}">
                <span
                  >${(this.localeData as { [key: string]: string })?.[
                    prayer
                  ]}</span
                >
              </a>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}
