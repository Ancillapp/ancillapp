import { html } from 'lit';
import { until } from 'lit/directives/until.js';
import { MagazineViewer } from './magazine-viewer.component';
import { load } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { MagazineType } from '../../models/magazine';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';
import '../../components/share-fab/share-fab.component';

export default function template(this: MagazineViewer) {
  const magazineType =
    this.type === MagazineType.ANCILLA_DOMINI
      ? 'Ancilla Domini'
      : '#sempreconnessi';
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a
        href="${this.localizeHref('magazines', this.type || '')}"
        slot="leadingIcon"
      >
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">
        ${until(
          this._magazinePromise.then(({ name }) => name),
          this.localize(t`loading`),
        )}
      </div>
    </top-app-bar>

    ${load(
      this._magazinePromise,
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
            title="Ancilla Domini - ${name}"
          ></iframe>

          <share-fab
            title="Ancilla Domini - ${name}"
            text="${this.localize(t`shareMagazineText ${magazineType}`)}"
            url="${window.location.href}"
          ></share-fab>
        `,
      (error) => html`${error.message}`,
    )}
  `;
}
