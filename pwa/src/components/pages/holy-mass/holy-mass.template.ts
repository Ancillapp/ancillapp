import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { HolyMassPage, Fraternity } from './holy-mass.component';
import { load } from '../../../helpers/directives';

import '@material/mwc-button';
import '@material/mwc-dialog';
import '../../outlined-select/outlined-select.component';
import '../../loading-button/loading-button.component';
import '../../date-input/date-input.component';

import type { OutlinedSelect } from '../../outlined-select/outlined-select.component';

import { remove } from '../../icons';

export default function template(this: HolyMassPage) {
  return html`
    ${this.user?.emailVerified
      ? html`
          ${load(
            this._bookedHolyMassesPromise,
            (holyMasses) => {
              const dayAlreadyBooked = holyMasses.some(
                ({ date }) => date.slice(0, 10) === this._selectedDate,
              );

              return html`
                <section>
                  <ul class="settings">
                    <li>
                      <label for="fraternity"
                        >${this.localeData?.fraternity}</label
                      >
                      <outlined-select
                        id="fraternity"
                        @change="${({ target }: Event) =>
                          (this._selectedFraternity = (target as OutlinedSelect).value)}"
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
                      <label for="seats">${this.localeData?.seats}</label>
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
                      <label for="date">${this.localeData?.date}</label>
                      <date-input
                        id="date"
                        set-label="${this.localeData?.set}"
                        cancel-label="${this.localeData?.cancel}"
                        value="${this._selectedDate}"
                        @change="${this._handleDateChange}"
                        min="${this._minDate}"
                        max="${this._maxDate}"
                      ></date-input>
                    </li>
                    <li>
                      <label for="time">${this.localeData?.time}</label>
                      <outlined-select
                        id="time"
                        @change="${({ target }: Event) =>
                          (this._selectedTime = (target as OutlinedSelect).value)}"
                        value="${this._selectedTime}"
                      >
                        ${this._getAvailableTimes(this._selectedFraternity).map(
                          (time) => html`<option>${time}</option>`,
                        )}
                      </outlined-select>
                    </li>
                  </ul>
                  <div class="available-seats">
                    <h4>Posti disponibili</h4>
                    <p>${this._availableSeats ?? '…'}</p>
                  </div>
                  <div class="book-action-bar">
                    <p>
                      ${dayAlreadyBooked
                        ? this.localeData?.dayAlreadyBooked
                        : nothing}
                    </p>
                    <loading-button
                      raised
                      label="${this.localeData?.book}"
                      slot="primaryAction"
                      dialogAction="book"
                      @click="${this._bookHolyMassSeat}"
                      ?loading="${this._bookingHolyMass}"
                      ?disabled="${dayAlreadyBooked}"
                    >
                    </loading-button>
                  </div>
                  <h3>${this.localeData?.bookedSeats}</h3>
                  ${holyMasses.length > 0
                    ? html`
                        <div class="responsive-table">
                          <table>
                            <thead>
                              <tr>
                                <th>${this.localeData?.fraternity}</th>
                                <th>${this.localeData?.date}</th>
                                <th>${this.localeData?.time}</th>
                                <th>${this.localeData?.seats}</th>
                                <th>${this.localeData?.actions}</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${repeat(
                                holyMasses,
                                ({ id }) => id,
                                (booking) => {
                                  const {
                                    fraternity: { id, location },
                                    date: dateString,
                                    seats,
                                  } = booking;

                                  const date = this._toLocalTimeZone(
                                    new Date(dateString),
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
                                        ${date < new Date()
                                          ? html`${nothing}`
                                          : html`
                                              <mwc-icon-button
                                                ?disabled="${this
                                                  ._bookingToCancel}"
                                                @click="${() =>
                                                  (this._bookingToCancel = booking)}"
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
                    : html`<p>${this.localeData?.noSeatsBooked}</p>`}
                </section>

                <mwc-dialog
                  ?open="${this._bookingToCancel}"
                  @closing="${this._cancelHolyMassSeatsBooking}"
                >
                  <p>
                    Sicuro di voler eliminare la tua prenotazione per la Messa
                    della Fraternità di
                    <strong
                      >${this._bookingToCancel?.fraternity.location}</strong
                    >
                    del giorno
                    <strong>
                      ${this._bookingToCancel?.date &&
                      Intl.DateTimeFormat(this.locale, {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).format(
                        this._toLocalTimeZone(
                          new Date(this._bookingToCancel?.date),
                        ),
                      )}
                    </strong>
                    alle ore
                    <strong
                      >${this._bookingToCancel?.date &&
                      Intl.DateTimeFormat(this.locale, {
                        hour: 'numeric',
                        minute: 'numeric',
                      }).format(
                        this._toLocalTimeZone(
                          new Date(this._bookingToCancel?.date),
                        ),
                      )}</strong
                    >?
                  </p>
                  <mwc-button dialogAction="close" slot="secondaryAction">
                    ${this.localeData?.close}
                  </mwc-button>
                  <mwc-button dialogAction="cancelBooking" slot="primaryAction">
                    ${this.localeData?.cancelBooking}
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
                  <p>
                    Per favore, verifica la tua email per usufruire del servizio
                    di prenotazione della Santa Messa.
                  </p>
                  ${this._verificationEmailSent
                    ? this._emailVerificationError
                      ? html`<p>${this._emailVerificationError}</p>`
                      : html`<p>Fatto! Controlla la tua casella di posta.</p>`
                    : html`
                        <mwc-button
                          raised
                          @click="${this._sendVerificationEmail}"
                          label="Reinvia email di verifica"
                        ></mwc-button>
                      `}
                `
              : html`
                  <p>
                    Per favore, effettua il login per usufruire del servizio di
                    prenotazione della Santa Messa.
                  </p>
                  <p><a href="/login">Vai alla pagina di login</a></p>
                `}
          </section>
        `}
  `;
}
