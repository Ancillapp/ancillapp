import { html } from 'lit';
import { until } from 'lit/directives/until.js';
import { MagazinesIndex } from './magazines-index.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';
import '../../components/date-input/date-input.component';
import '../../components/loading-spinner/loading-spinner.component';
import { MagazineType } from '../../models/magazine';

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

export default function template(this: MagazinesIndex) {
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
      <div slot="title">${this.localize(t`magazines`)}</div>
    </top-app-bar>

    <div class="magazines-container">
      ${[
        {
          type: MagazineType.ANCILLA_DOMINI,
          promise: this._latestAncillaDominiPromise,
        },
        {
          type: MagazineType.SEMPRECONNESSI,
          promise: this._latestSempreconnessiPromise,
        },
      ].map(({ type, promise }) => {
        const magazineType =
          type === MagazineType.ANCILLA_DOMINI
            ? 'Ancilla Domini'
            : '#sempreconnessi';

        return html`
          <a
            href="${this.localizeHref('magazines', type)}"
            title="${magazineType}"
            class="magazine"
          >
            <figure>
              ${until(
                promise.then(
                  ({ thumbnail }) => html`
                    <img
                      src="${thumbnail}"
                      alt="${magazineType}"
                      width="340"
                      height="480"
                      loading="lazy"
                    />
                  `,
                ),
                html`
                  <div class="magazine-loading-container">
                    <loading-spinner></loading-spinner>
                  </div>
                `,
              )}
              <figcaption>${magazineType}</figcaption>
            </figure>
          </a>
        `;
      })}
    </div>
  `;
}
