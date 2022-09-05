import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BreviaryPlaceholder } from './breviary-placeholder.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

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

export default function template(this: BreviaryPlaceholder) {
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
      <h2>${this.localize(t`breviaryUnavailable`)}</h2>
      <p>${unsafeHTML(this.localize(t`breviaryAlternative`))}</p>
    </section>
  `;
}
