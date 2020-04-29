import { html } from 'lit-element';
import { cache } from 'lit-html/directives/cache';
import { AncillasPage } from './ancillas.component';

import '../../ancilla-viewer/ancilla-viewer.component';
import '../../ancillas-list/ancillas-list.component';

export default function template(this: AncillasPage) {
  return html`${cache(
    this.subroute
      ? html`<ancilla-viewer ancilla="${this.subroute}"></ancilla-viewer>`
      : html`<ancillas-list></ancillas-list>`,
  )}`;
}
