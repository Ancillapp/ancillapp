import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { AncillaViewer } from './ancilla-viewer.component';
import { load } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';
import '../../components/share-fab/share-fab.component';

export default function template(this: AncillaViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('ancillas')}" slot="leadingIcon">
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">
        ${until(
          this._ancillaPromise.then(
            ({ name: { [this.locale]: localizedName } }) => localizedName,
          ),
          this.localize(t`loading`),
        )}
      </div>
    </top-app-bar>

    ${load(
      this._ancillaPromise,
      ({ link, name }) =>
        html`
          <iframe
            src="${this.active
              ? `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                  link,
                )}`
              : ''}"
            referrerpolicy="no-referrer"
            allow="fullscreen"
            title="Ancilla Domini - ${name[this.locale]}"
          ></iframe>

          <share-fab
            title="Ancilla Domini - ${name[this.locale]}"
            text="${this.localize(t`shareAncillaText`)}"
            url="${window.location.href}"
          ></share-fab>
        `,
      (error) => html`${error.message}`,
    )}
  `;
}
