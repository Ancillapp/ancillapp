import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { AncillasPage } from './ancillas.component';

import '../../loading-spinner/loading-spinner.component';

export default function template(this: AncillasPage) {
  const subroute = this.subroute
    ? import('../../pdf-viewer/pdf-viewer.component').then(
        () => html`<pdf-viewer
          src="https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2FAD2_2018.pdf?alt=media"
        ></pdf-viewer>`,
      )
    : import('../../ancillas-list/ancillas-list.component').then(
        () => html`<ancillas-list></ancillas-list>`,
      );

  return until(subroute, html`<loading-spinner></loading-spinner>`);
}
