import { html } from 'lit-element';
import { cache } from 'lit-html/directives/cache';
import { AncillasPage } from './ancillas.component';

import '../../ancilla-viewer/ancilla-viewer.component';
import '../../ancillas-list/ancillas-list.component';

export default function template(this: AncillasPage) {
  return html`${cache(
    this.subroute
      ? html`
          <ancilla-viewer
            ?active="${this.active && this.subroute}"
            ?drawer-open="${this.drawerOpen}"
            ancilla="${this.subroute}"
          ></ancilla-viewer>
        `
      : html`
          <ancillas-list
            ?active="${this.active && !this.subroute}"
            ?drawer-open="${this.drawerOpen}"
            @menutoggle="${(event: CustomEvent) =>
              this.dispatchEvent(new CustomEvent(event.type, event))}"
          ></ancillas-list>
        `,
  )}`;
}
