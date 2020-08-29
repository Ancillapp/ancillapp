import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { InfoPage } from './info.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';

export default function template(this: InfoPage) {
  const websiteUrl = `
    <a href="https://www.ffbetania.net/${this.locale}">
      ffbetania.net
    </a>
  `;

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
      <div slot="title">${this.localize(t`info`)}</div>
    </top-app-bar>

    <section>
      <h2>${this.localize(t`ffbInfoTitle`)}</h2>
      ${unsafeHTML(this.localize(t`ffbInfoDescription`))}

      <h2>${this.localize(t`marianSpiritualityTitle`)}</h2>
      ${unsafeHTML(this.localize(t`marianSpiritualityDescription`))}

      <h2>${this.localize(t`franciscanSpiritualityTitle`)}</h2>
      ${unsafeHTML(this.localize(t`franciscanSpiritualityDescription`))}

      <h2>${this.localize(t`founderAndFoundationTitle`)}</h2>
      ${unsafeHTML(this.localize(t`founderDescription`))}
      <blockquote>
        ${this.localize(t`foundationPhrase`)}
        <footer>
          — <cite>${this.localize(t`foundationPhraseAuthor`)}</cite>
        </footer>
      </blockquote>
      ${unsafeHTML(this.localize(t`foundationDescription`))}

      <h2>${this.localize(t`pillarsTitle`)}</h2>

      <h3>${this.localize(t`prayerPillarTitle`)}</h3>
      ${unsafeHTML(this.localize(t`prayerPillarDescription`))}

      <h3>${this.localize(t`hospitalityPillarTitle`)}</h3>
      ${unsafeHTML(this.localize(t`hospitalityPillarDescription`))}

      <h3>${this.localize(t`brotherlyLifePillarTitle`)}</h3>
      ${unsafeHTML(this.localize(t`brotherlyLifePillarDescription`))}

      <p>${unsafeHTML(this.localize(t`moreInfoWebsite ${websiteUrl}`))}</p>
    </section>
  `;
}
