import { html } from 'lit-element';
import { AncillasPage } from './ancillas.component';

import '../ancilla-viewer/ancilla-viewer.component';
import '../ancillas-list/ancillas-list.component';

export default function template(this: AncillasPage) {
  return html`
    <ancilla-viewer
      class="page"
      ?active="${this.active && this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      ancilla="${this.subroute}"
    ></ancilla-viewer>
    <ancillas-list
      class="page"
      ?active="${this.active && !this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      @menutoggle="${(event: CustomEvent) =>
        this.dispatchEvent(new CustomEvent(event.type, event))}"
    ></ancillas-list>
  `;
}
