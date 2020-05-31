import { html } from 'lit-element';
import { BreviaryPage } from './breviary.component';

import '../../breviary-viewer/breviary-viewer.component';
import '../../breviary-index/breviary-index.component';

export default function template(this: BreviaryPage) {
  return html`
    <breviary-viewer
      class="page"
      ?active="${this.active && this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      query="${this.subroute}"
    ></breviary-viewer>
    <breviary-index
      class="page"
      ?active="${this.active && !this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      @menutoggle="${(event: CustomEvent) =>
        this.dispatchEvent(new CustomEvent(event.type, event))}"
    ></breviary-index>
  `;
}
