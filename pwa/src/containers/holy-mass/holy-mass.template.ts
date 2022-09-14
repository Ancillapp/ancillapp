import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HolyMassPage } from './holy-mass.component';
import { load } from '../../helpers/directives';
import { remove, menu } from '../../components/icons';
import { toLocalTimeZone } from '../../helpers/utils';
import { t } from '@lingui/macro';

import '@material/mwc-button';
import '@material/mwc-dialog';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/outlined-select/outlined-select.component';
import '../../components/loading-button/loading-button.component';
// import '../../components/date-input/date-input.component';

import type { OutlinedSelect } from '../../components/outlined-select/outlined-select.component';

export default function template(this: HolyMassPage) {
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
      <div slot="title">${this.localize(t`holyMass`)}</div>
    </top-app-bar>

    ${this.user?.emailVerified
      ? html`
          ${load(
            this._bookedHolyMassesPromise,
            (holyMasses) => {
              const dayAlreadyBooked = holyMasses.some(
                ({ date }) => date.slice(0, 10) === this._selectedDate,
              );

              const availableTimes = this._getAvailableTimes(
                this._selectedFraternity,
              );

              return html`
                <section>
                  <ul class="settings">
                    <li>
                      <label for="fraternity"
                        >${this.localize(t`fraternity`)}</label
                      >
                      <outlined-select
                        id="fraternity"
                        @change="${({ target }: Event) =>
                          (this._selectedFraternity = (
                            target as OutlinedSelect
                          ).value)}"
                        value="${this._selectedFraternity}"
                      >
                        ${this._fraternities.map(
                          ({ id, location }) => html`
                            <option value="${id}">${location}</option>
                          `,
                        )}
                      </outlined-select>
                    </li>
                    <li>
                      <label for="seats">${this.localize(t`seats`)}</label>
                      <outlined-select
                        id="seats"
                        @change="${({ target }: Event) =>
                          (this._selectedSeats = parseInt(
                            (target as OutlinedSelect).value,
                            10,
                          ))}"
                        value="${this._selectedSeats}"
                      >
                        ${[
                          ...Array(Math.min(5, this._availableSeats ?? 5)),
                        ].map(
                          (_, index) => html` <option>${index + 1}</option> `,
                        )}
                      </outlined-select>
                    </li>
                    <li>
                      <label for="date">${this.localize(t`date`)}</label>
                      <date-input
                        id="date"
                        set-label="${this.localize(t`set`)}"
                        cancel-label="${this.localize(t`cancel`)}"
                        value="${this._selectedDate}"
                        @change="${this._handleDateChange}"
                        min="${this._minDate}"
                        max="${this._maxDate}"
                      ></date-input>
                    </li>
                    <li>
                      <label for="time">${this.localize(t`time`)}</label>
                      <outlined-select
                        id="time"
                        @change="${({ target }: Event) =>
                          (this._selectedTime = (
                            target as OutlinedSelect
                          ).value)}"
                        value="${this._selectedTime}"
                        ?disabled="${availableTimes.length < 1}"
                      >
                        ${availableTimes.map(
                          (time) => html`<option>${time}</option>`,
                        )}
                      </outlined-select>
                    </li>
                  </ul>
                  <div class="available-seats">
                    <h4>${this.localize(t`availableSeats`)}</h4>
                    <p>${this._availableSeats ?? '-'}</p>
                  </div>
                  <div class="book-action-bar">
                    <p>
                      ${dayAlreadyBooked
                        ? this.localize(t`dayAlreadyBooked`)
                        : availableTimes.length < 1
                        ? this.localize(t`noHolyMassesAvailable`)
                        : nothing}
                    </p>
                    <loading-button
                      raised
                      label="${this.localize(t`book`)}"
                      slot="primaryAction"
                      dialogAction="book"
                      @click="${this._bookHolyMassSeat}"
                      ?loading="${this._bookingHolyMass}"
                      ?disabled="${dayAlreadyBooked ||
                      availableTimes.length < 1}"
                    >
                    </loading-button>
                  </div>
                  <h3>${this.localize(t`bookedSeats`)}</h3>
                  ${holyMasses.length > 0
                    ? html`
                        <div class="responsive-table">
                          <table>
                            <thead>
                              <tr>
                                <th>${this.localize(t`fraternity`)}</th>
                                <th>${this.localize(t`date`)}</th>
                                <th>${this.localize(t`time`)}</th>
                                <th>${this.localize(t`seats`)}</th>
                                <th>${this.localize(t`actions`)}</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${repeat(
                                holyMasses,
                                ({ id }) => id,
                                (booking) => {
                                  const {
                                    fraternity: { location },
                                    date: dateString,
                                    seats,
                                  } = booking;

                                  const date = toLocalTimeZone(
                                    new Date(dateString),
                                  );

                                  const thirtyMinutesBeforeDate = new Date(
                                    date,
                                  );
                                  thirtyMinutesBeforeDate.setMinutes(
                                    date.getMinutes() - 30,
                                  );

                                  return html`
                                    <tr>
                                      <td>${location}</td>
                                      <td>
                                        ${Intl.DateTimeFormat(this.locale, {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        }).format(date)}
                                      </td>
                                      <td>
                                        ${Intl.DateTimeFormat(this.locale, {
                                          hour: 'numeric',
                                          minute: 'numeric',
                                        }).format(date)}
                                      </td>
                                      <td class="right">${seats}</td>
                                      <td class="center">
                                        ${thirtyMinutesBeforeDate < new Date()
                                          ? nothing
                                          : html`
                                              <mwc-icon-button
                                                ?disabled="${this
                                                  ._bookingToCancel}"
                                                @click="${() =>
                                                  (this._bookingToCancel =
                                                    booking)}"
                                                label="${this.localize(
                                                  t`cancelBooking`,
                                                )}"
                                              >
                                                ${remove}
                                              </mwc-icon-button>
                                            `}
                                      </td>
                                    </tr>
                                  `;
                                },
                              )}
                            </tbody>
                          </table>
                        </div>
                      `
                    : html`<p>${this.localize(t`noSeatsBooked`)}</p>`}
                </section>

                <mwc-dialog
                  ?open="${this._bookingToCancel}"
                  @closing="${this._cancelHolyMassSeatsBooking}"
                >
                  ${unsafeHTML(
                    this.localize(
                      t`bookingCancellationConfirmation ${
                        this._bookingToCancel?.fraternity.location
                      } ${
                        this._bookingToCancel?.date &&
                        Intl.DateTimeFormat(this.locale, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        }).format(
                          toLocalTimeZone(
                            new Date(this._bookingToCancel?.date),
                          ),
                        )
                      } ${
                        this._bookingToCancel?.date &&
                        Intl.DateTimeFormat(this.locale, {
                          hour: 'numeric',
                          minute: 'numeric',
                        }).format(
                          toLocalTimeZone(
                            new Date(this._bookingToCancel?.date),
                          ),
                        )
                      }`,
                    ),
                  )}
                  <mwc-button dialogAction="close" slot="secondaryAction">
                    ${this.localize(t`close`)}
                  </mwc-button>
                  <mwc-button dialogAction="cancelBooking" slot="primaryAction">
                    ${this.localize(t`cancelBooking`)}
                  </mwc-button>
                </mwc-dialog>
              `;
            },
            (error) => html`${error}`,
          )}
        `
      : html`
          <section>
            ${this.user
              ? html`
                  <p>${this.localize(t`verifyEmailToBook`)}</p>
                  ${this._verificationEmailSent
                    ? this._emailVerificationError
                      ? html`<p>${this._emailVerificationError}</p>`
                      : html`<p>${this.localize(t`checkYourInbox`)}</p>`
                    : html`
                        <mwc-button
                          raised
                          @click="${this._sendVerificationEmail}"
                          label="${this.localize(t`resendVerificationEmail`)}"
                        ></mwc-button>
                      `}
                `
              : html`
                  <p>${this.localize(t`loginToBook`)}</p>
                  <p>
                    <a href="${this.localizeHref('login')}">
                      ${this.localize(t`goToLogin`)}
                    </a>
                  </p>
                `}
          </section>
        `}
  `;
}
