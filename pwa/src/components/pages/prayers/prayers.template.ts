import { html } from 'lit-element';
import { PrayersPage } from './prayers.component';

import '../../prayer-viewer/prayer-viewer.component';
import '../../prayers-list/prayers-list.component';

export default function template(this: PrayersPage) {
  return html`
    <prayer-viewer
      class="page"
      ?active="${this.active && this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      prayer="${this.subroute}"
    ></prayer-viewer>
    <prayers-list
      class="page"
      ?active="${this.active && !this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      @menutoggle="${(event: CustomEvent) =>
        this.dispatchEvent(new CustomEvent(event.type, event))}"
    ></prayers-list>
  `;
}
