import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { BreviaryIndex } from './breviary-index.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-textfield';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/date-input/date-input.component';

export const prayersTranslations = {
  invitatory: t`invitatory`,
  matins: t`matins`,
  lauds: t`lauds`,
  terce: t`terce`,
  sext: t`sext`,
  none: t`none`,
  vespers: t`vespers`,
  compline: t`compline`,
};

export default function template(this: BreviaryIndex) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        label="${this.localize(t`menu`)}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">${this.localize(t`breviary`)}</div>
    </top-app-bar>

    <section>
      <date-input
        label="${this.localize(t`date`)}"
        set-label="${this.localize(t`set`)}"
        cancel-label="${this.localize(t`cancel`)}"
        value="${this._date}"
        @change="${this._handleDateChange}"
      ></date-input>
      ${until(
        this._titlePromise,
        html`<h2>${this.localize(t`loading`)?.toUpperCase()}</h2>`,
      )}
      <ul>
        ${([
          'invitatory',
          'matins',
          'lauds',
          'terce',
          'sext',
          'none',
          'vespers',
          'compline',
        ] as (keyof typeof prayersTranslations)[]).map(
          (prayer) => html`
            <li>
              <a href="${this.localizeHref('breviary', prayer, this._date)}">
                <span>${prayersTranslations[prayer]}</span>
              </a>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}
