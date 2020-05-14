import { html } from 'lit-element';
import { AncillaViewer } from './ancilla-viewer.component';
import { load } from '../../helpers/directives';

import '../share-button/share-button.component';

export default function template(this: AncillaViewer) {
  return html`
    ${load(
      this._ancillaPromise,
      ({ link, name }) =>
        html`
          <iframe
            src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
              link,
            )}"
            referrerpolicy="no-referrer"
            allow="fullscreen"
            title="Ancilla Domini - ${name[this.locale]}"
          ></iframe>

          <share-button
            title="Ancilla Domini - ${name[this.locale]}"
            text="${this.localeData?.shareAncillaText}"
            url="${window.location.href}"
          ></share-button>
        `,
      (error) => html`${error.message}`,
    )}
  `;
}
