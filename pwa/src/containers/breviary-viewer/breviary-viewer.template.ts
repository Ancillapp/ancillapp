import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
  BreviaryViewer,
  localizedPrayerToKeyMap,
} from './breviary-viewer.component';
import { load } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { prayersTranslations } from '../breviary-index/breviary-index.template';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';

export default function template(this: BreviaryViewer) {
  const [prayer, date = new Date().toISOString().slice(0, 10)] =
    this.query!.split('/');

  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('breviary')}" slot="leadingIcon">
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">
        ${prayersTranslations[
          localizedPrayerToKeyMap[prayer] as keyof typeof prayersTranslations
        ]}
        -
        ${Intl.DateTimeFormat(this.locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(date))}
      </div>
    </top-app-bar>

    ${load(
      this._breviaryPromise,
      (content) => html`<section>${unsafeHTML(content)}</section>`,
      (error) => html`${error.message}`,
    )}
  `;
}
