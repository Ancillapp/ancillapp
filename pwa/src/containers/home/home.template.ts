import { html } from 'lit-element';
import {
  ancillasIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
  holyMassIcon,
  menu,
} from '../../components/icons';
import { HomePage } from './home.component';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';

export default function template(this: HomePage) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${this.localize(t`home`)}
      </div>
    </top-app-bar>

    <section>
      <h2>${this.localize(t`peaceAndGood`)}</h2>
      <ul>
        <li>
          <a href="${this.localizeHref('breviary')}">
            <span>${this.localize(t`prayLiturgy`)}</span>
            ${breviaryIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('songs')}">
            <span>${this.localize(t`singFraternitySongs`)}</span>
            ${songsIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('prayers')}">
            <span>${this.localize(t`prayDailyPrayers`)}</span>
            ${prayersIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('ancillas', 'latest')}">
            <span>${this.localize(t`readLatestAncilla`)}</span>
            ${ancillasIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('holy-mass')}">
            <span>${this.localize(t`bookHolyMassSeat`)}</span>
            ${holyMassIcon}
          </a>
        </li>
      </ul>
    </section>
  `;
}
