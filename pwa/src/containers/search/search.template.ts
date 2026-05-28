import { html } from 'lit';
import { SearchPage } from './search.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/core/macro';

import '../../components/top-app-bar/top-app-bar.component';
import './search-content.component';

export default function template(this: SearchPage) {
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
      <div slot="title">${this.localize(t`search`)}</div>
    </top-app-bar>

    <search-content></search-content>
  `;
}
