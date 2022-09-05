import { html, nothing } from 'lit';
import { PrayerViewer } from './prayer-viewer.component';
import { compile } from '../../helpers/directives';
import { arrowBack } from '../../components/icons';
import { t } from '@lingui/macro';
import { Prayer } from '../../models/prayer';

import '@material/mwc-snackbar';
import '@material/mwc-tab-bar';
import '@material/mwc-tab';
import '../../components/top-app-bar/top-app-bar.component';

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
        ${this._prayerStatus.data?.title[this.locale] ||
        this._prayerStatus.data?.title.la ||
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

    ${this._prayerStatus.loading || !this._prayerStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <section
            class="${this._prayerLanguages.length > 1 ? 'multilanguage' : ''}"
          >
            ${this._selectedPrayerLanguage in this._prayerStatus.data.content
              ? compile(
                  this._prayerStatus.data.content[
                    this._selectedPrayerLanguage
                  ]!,
                )
              : html`${nothing}`}
          </section>
        `}

    <mwc-snackbar
      leading
      ?open="${this._prayerStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
