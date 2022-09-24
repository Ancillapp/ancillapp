import { html, nothing } from 'lit';
import { when } from 'lit/directives/when.js';
import { PrayerViewer } from './prayer-viewer.component';
import { renderPrayer } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { t } from '@lingui/macro';
import { Prayer } from '../../models/prayer';

import '@material/mwc-snackbar';
import '@material/mwc-tab-bar';
import '@material/mwc-tab';
import '../../components/top-app-bar/top-app-bar.component';
import('../../components/error-box/error-box.component');

const languagesTranslationMap: Record<keyof Prayer['title'], string> = {
  it: t`italian`,
  la: t`latin`,
  de: t`german`,
  en: t`english`,
  pt: t`portuguese`,
};

export default function template(this: PrayerViewer) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('prayers')}" slot="leadingIcon">
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">
        ${this._prayerStatus.data?.title[this._selectedPrayerLanguage] ||
        this.localize(t`loading`)}
      </div>
      ${this._prayerLanguages.length > 1
        ? html`
            <mwc-tab-bar
              activeIndex="${this._prayerLanguages.indexOf(
                this._selectedPrayerLanguage,
              )}"
            >
              ${this._prayerLanguages.map(
                (language) =>
                  html`
                    <mwc-tab
                      label="${languagesTranslationMap[language]}"
                      @click="${() =>
                        (this._selectedPrayerLanguage = language)}"
                    ></mwc-tab>
                  `,
              )}
            </mwc-tab-bar>
          `
        : html`${nothing}`}
    </top-app-bar>

    ${when(
      this._prayerStatus.loading ||
        (this._prayerStatus.refreshing && !this._prayerStatus.data?.content),
      () => html`
        <div class="loading-container">
          <loading-spinner></loading-spinner>
        </div>
      `,
    )}
    ${when(
      this._prayerStatus.error && !this._prayerStatus.data?.content,
      () => html`
        <div class="error-container">
          <error-box .error="${this._prayerStatus.error}"></error-box>
        </div>
      `,
    )}
    ${when(
      this._prayerStatus.data?.content,
      () => html`
        <section
          class="${this._prayerLanguages.length > 1 ? 'multilanguage' : ''}"
        >
          ${this._selectedPrayerLanguage in this._prayerStatus.data!.content
            ? renderPrayer(
                this._prayerStatus.data!.content[this._selectedPrayerLanguage]!,
              )
            : nothing}
        </section>
      `,
    )}

    <mwc-snackbar
      leading
      ?open="${this._prayerStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
