import { html } from 'lit-element';
import {
  ancillasIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
  holyMassIcon,
  menu,
  tau,
} from '../../icons';
import { HomePage } from './home.component';

import '../../top-app-bar/top-app-bar.component';

export default function template(this: HomePage) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${tau} Ancillapp
      </div>
    </top-app-bar>

    <section>
      <h2>${this.localeData?.peaceAndGood}</h2>
      <ul>
        <li>
          <a href="${this.localizeHref('breviary')}">
            <span>${this.localeData?.prayLiturgy}</span>
            ${breviaryIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('songs')}">
            <span>${this.localeData?.singFraternitySongs}</span>
            ${songsIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('prayers')}">
            <span>${this.localeData?.prayDailyPrayers}</span>
            ${prayersIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('ancillas', 'latest')}">
            <span>${this.localeData?.readLatestAncilla}</span>
            ${ancillasIcon}
          </a>
        </li>
        <li>
          <a href="${this.localizeHref('holy-mass')}">
            <span>${this.localeData?.bookHolyMassSeat}</span>
            ${holyMassIcon}
          </a>
        </li>
      </ul>
    </section>
  `;
}
