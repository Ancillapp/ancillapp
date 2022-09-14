import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { MagazinesList } from './magazines-list.component';
import { arrowBack } from '../../components/icons';
import { MagazineFrequency, MagazineType } from '../../models/magazine';
import { toLocalTimeZone } from '../../helpers/utils';
import { t } from '@lingui/macro';

import '@material/mwc-button';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/unobtrusive-notification/unobtrusive-notification.component';

const frequencyToMonthsNumber: Record<MagazineFrequency, number> = {
  [MagazineFrequency.BIMONTHLY]: 2,
  [MagazineFrequency.QUARTERLY]: 3,
  [MagazineFrequency.SPECIAL]: 0,
};

const computeIntervalEnd = (frequency: MagazineFrequency, from: Date) => {
  const to = new Date(from);
  const monthsNumber = frequencyToMonthsNumber[frequency];
  to.setMonth(to.getMonth() + monthsNumber - 1);
  return to;
};

const getMagazineDateDescription = (
  frequency: MagazineFrequency,
  isoDate: string,
  locale: string,
) => {
  const parsedDate = toLocalTimeZone(new Date(isoDate));
  if (frequency === MagazineFrequency.SPECIAL) {
    const date = parsedDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return t`magazineSpecial ${date}`;
  }
  const toDate = computeIntervalEnd(frequency, parsedDate);
  const year = parsedDate.toLocaleDateString(locale, { year: 'numeric' });
  const fromMonth = parsedDate.toLocaleDateString(locale, { month: 'long' });
  const toMonth = toDate.toLocaleDateString(locale, { month: 'long' });
  return `${fromMonth}-${toMonth} ${year}`;
};

export default function template(this: MagazinesList) {
  const magazineType =
    this.type === MagazineType.ANCILLA_DOMINI
      ? 'Ancilla Domini'
      : '#sempreconnessi';

  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <a href="${this.localizeHref('magazines')}" slot="leadingIcon">
        <mwc-icon-button label="${this.localize(t`back`)}">
          ${arrowBack}
        </mwc-icon-button>
      </a>
      <div slot="title">${magazineType}</div>
    </top-app-bar>

    <unobtrusive-notification
      ?hidden="${!this._needUserNotificationsPermission}"
    >
      ${this.localize(t`newMagazineNotification ${magazineType}`)}
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('never')}"
        label="${this.localize(t`dontAskAnymore`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('no')}"
        label="${this.localize(t`noThanks`)}"
        dense
      ></mwc-button>
      <mwc-button
        slot="actions"
        @click="${() => this._updateNotificationsPermission('yes')}"
        label="${this.localize(t`sure`)}"
        primary
        dense
      ></mwc-button>
    </unobtrusive-notification>

    ${this._magazinesStatus.loading || !this._magazinesStatus.data
      ? html`
          <div class="loading-container">
            <loading-spinner></loading-spinner>
          </div>
        `
      : html`
          <div class="magazines-container">
            ${this._magazinesStatus.data.length < 1
              ? html`<p>${this.localize(t`noResults`)}</p>`
              : html`${nothing}`}
            ${repeat(
              this._displayedMagazines,
              ({ code }) => `${this.type}/${code}`,
              ({ type, code, name, frequency, date, thumbnail }) => html`
                <a
                  href="${this.localizeHref('magazines', type, code)}"
                  title="${magazineType} - ${name}"
                  class="magazine"
                >
                  <figure>
                    <img
                      src="${thumbnail}"
                      alt="${magazineType} - ${name}"
                      width="340"
                      height="480"
                      loading="lazy"
                    />
                    <figcaption>
                      <div class="title">${name}</div>
                      <div class="subtitle">
                        ${getMagazineDateDescription(
                          frequency,
                          date,
                          this.locale,
                        )}
                      </div>
                    </figcaption>
                  </figure>
                </a>
              `,
            )}
          </div>
        `}

    <mwc-snackbar
      leading
      ?open="${this._magazinesStatus.refreshing}"
      labelText="${this.localize(t`syncInProgress`)}"
    ></mwc-snackbar>
  `;
}
