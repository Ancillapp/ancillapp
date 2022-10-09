import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { until } from 'lit/directives/until.js';
import { toLocalTimeZone } from '../../helpers/utils';
import { LiturgyColor } from '../../models/holy-mass';

import { LiturgyViewer } from './liturgy-viewer.component';
import { load, renderWithNewlines } from '../../helpers/directives';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '../../components/top-app-bar/top-app-bar.component';
import('../../components/error-box/error-box.component');

const liturgicalColorToHexMap: Record<LiturgyColor, string> = {
  [LiturgyColor.GREEN]: '#080',
  [LiturgyColor.VIOLET]: '#7f00ff',
  [LiturgyColor.ROSE]: '#fbcce7',
  [LiturgyColor.WHITE]: '#fff',
  [LiturgyColor.RED]: '#a00',
  [LiturgyColor.BLACK]: '#000',
};

const getLiturgicalColorBackgroundStyle = (
  liturgicalColor: LiturgyColor | undefined,
): string | undefined =>
  liturgicalColor
    ? [
        'border-color: var(--ancillapp-divider-color);',
        `background: ${liturgicalColorToHexMap[liturgicalColor]};`,
      ].join('')
    : '';

export default function template(this: LiturgyViewer) {
  const liturgicalBackgroundStylePromise = this._liturgyPromise.then(
    ({ color }) => getLiturgicalColorBackgroundStyle(color),
  );

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
      <div
        class="liturgical-color"
        style="${until(liturgicalBackgroundStylePromise, undefined)}"
      ></div>
    </top-app-bar>

    <date-input
      label="${this.localize(t`date`)}"
      set-label="${this.localize(t`set`)}"
      cancel-label="${this.localize(t`cancel`)}"
      value="${this.day}"
      @change="${this._handleDayChange}"
    ></date-input>

    ${load(
      this._liturgyPromise,
      (content) => html`
        <section>
          ${map(
            content.sections,
            (section) => html`
              ${when(
                section.title,
                () => html`<h3>${renderWithNewlines(section.title!)}</h3>`,
              )}
              ${when(
                section.subtitle,
                () => html`<h4>${renderWithNewlines(section.subtitle!)}</h4>`,
              )}
              ${map(
                (section.sections || []) as string[],
                (paragraph) =>
                  html`
                    <p>
                      ${renderWithNewlines(
                        paragraph.replace(
                          /(\d+)([a-z])(?![a-z]\s+\d)/gi,
                          '<sup>$1</sup>$2',
                        ),
                      )}
                    </p>
                  `,
              )}
            `,
          )}
        </section>
      `,
      (error) => html`
        <div class="error-container">
          <error-box .error="${error}"></error-box>
        </div>
      `,
    )}
  `;
}
