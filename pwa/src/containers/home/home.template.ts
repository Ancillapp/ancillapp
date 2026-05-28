import { html, nothing } from 'lit';
import {
  magazinesActive,
  breviary,
  prayersActive,
  songsActive,
  holyMassActive,
  tau,
  menu,
} from '../../components/icons.js';
import { formatDateToUrl } from '../../helpers/utils';
import { HomePage } from './home.component';
import { t } from '@lingui/core/macro';

import 'mdui/components/button-icon.js';
import 'mdui/components/card.js';

export default function template(this: HomePage) {
  return html`
    <div class="app-header">
      ${this.showMenuButton
        ? html`<mdui-button-icon
            class="menu-button"
            aria-label="${this.localize(t`menu`)}"
            @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
            >${menu}</mdui-button-icon
          >`
        : nothing}
      ${tau}
      <span>Ancillapp</span>
    </div>

    <div class="hero">
      <div class="hero-content">
        <h1>${this.localize(t`peaceAndGood`)}</h1>
        <p class="hero-subtitle">${this._todaySubtitle}</p>
      </div>
      <div class="hero-watermark" aria-hidden="true">${tau}</div>
    </div>

    <section>
      <h2 class="section-label">${this.localize(t`forToday`)}</h2>
      <div class="nav-grid">
        <!-- TODO -->
        <!-- <mdui-card
          clickable
          href="${this.localizeHref('breviary')}"
          class="nav-card card-breviary"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label">${this.localize(t`prayLiturgy`)}</span>
            <div class="nav-card-icon">${breviary}</div>
          </div>
        </mdui-card> -->

        <mdui-card
          clickable
          href="${this.localizeHref('songs')}"
          class="nav-card card-songs"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`singFraternitySongs`)}</span
            >
            <div class="nav-card-icon">${songsActive}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('prayers')}"
          class="nav-card card-prayers"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`prayDailyPrayers`)}</span
            >
            <div class="nav-card-icon">${prayersActive}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('holy-mass')}/${formatDateToUrl(
            new Date(),
          )}"
          class="nav-card card-holy-mass"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`readLiturgyOfTheDay`)}</span
            >
            <div class="nav-card-icon">${holyMassActive}</div>
          </div>
        </mdui-card>

        <mdui-card
          clickable
          href="${this.localizeHref('magazines')}"
          class="nav-card card-magazines"
        >
          <div class="nav-card-inner">
            <span class="nav-card-label"
              >${this.localize(t`readFraternityMagazines`)}</span
            >
            <div class="nav-card-icon">${magazinesActive}</div>
          </div>
        </mdui-card>
      </div>
    </section>
  `;
}
