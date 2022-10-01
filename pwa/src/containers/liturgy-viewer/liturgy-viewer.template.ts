import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { LiturgyViewer } from './liturgy-viewer.component';
import { load } from '../../helpers/directives';
import { menu } from '../../components/icons';
import { toLocalTimeZone } from '../../helpers/utils';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';

export default function template(this: LiturgyViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        label="${this.localize(t`menu`)}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">
        ${this.localize(t`liturgyOfTheDay`)} -
        ${toLocalTimeZone(this.day).toLocaleDateString(this.locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </div>
    </top-app-bar>

    <section>
      <date-input
        label="${this.localize(t`date`)}"
        set-label="${this.localize(t`set`)}"
        cancel-label="${this.localize(t`cancel`)}"
        value="${this.day}"
        @change="${this._handleDayChange}"
      ></date-input>
      ${load(
        this._breviaryPromise,
        (content) => html`
          ${map(
            content.sections,
            (section) => html`
              ${when(section.title, () => html`<h3>${section.title}</h3>`)}
              ${when(
                section.subtitle,
                () => html`<h4>${section.subtitle}</h4>`,
              )}
              ${map(
                (section.sections || []) as string[],
                (paragraph) =>
                  html`<p>
                    ${map(
                      paragraph.split('\n'),
                      (row, index) =>
                        html`${index === 0 ? '' : html`<br />`}${row.trim()}`,
                    )}
                  </p>`,
              )}
            `,
          )}
        `,
        (error) => html`${error.message}`,
      )}
    </section>
  `;
}
