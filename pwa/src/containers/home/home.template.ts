import { html } from 'lit';
import {
  magazinesActive,
  breviary,
  prayersActive,
  songsActive,
  holyMassActive,
  tau,
} from '../../components/icons.js';
import { formatDateToUrl } from '../../helpers/utils';
import { HomePage } from './home.component';
import { t } from '@lingui/core/macro';

import 'mdui/components/top-app-bar/top-app-bar.js';
import 'mdui/components/top-app-bar/top-app-bar-title.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/card.js';
import '../../components/ancillapp-icon.component.js';

export default function template(this: HomePage) {
  return html`
    <mdui-top-app-bar
      scroll-behavior="hide"
      .scrollTarget="${this.scrollTarget}"
    >
      <mdui-button-icon
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        aria-label="${this.localize(t`menu`)}"
      >
        <ancillapp-icon name="menu"></ancillapp-icon>
      </mdui-button-icon>
      <mdui-top-app-bar-title>
        <ancillapp-icon name="tau"></ancillapp-icon>
        <span>Ancillapp</span>
      </mdui-top-app-bar-title>
    </mdui-top-app-bar>

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
