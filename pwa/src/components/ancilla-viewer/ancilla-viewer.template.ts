import { html } from 'lit-element';
import { AncillaViewer } from './ancilla-viewer.component';
import { load, compile } from '../../helpers/directives';

export default function template(this: AncillaViewer) {
  return html`
    ${load(
      this._ancillaPromise,
      ({ link }) =>
        html`<iframe
          src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
            link,
          )}"
          referrerpolicy="no-referrer"
          allow="fullscreen"
        ></iframe>`,
      (error) => html`${error.message}`,
    )}
  `;
}