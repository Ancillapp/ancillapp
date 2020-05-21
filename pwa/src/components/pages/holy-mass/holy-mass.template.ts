import { html } from 'lit-element';
import { nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { HolyMassPage } from './holy-mass.component';
import { load } from '../../../helpers/directives';

import '@material/mwc-button';
import '../../outlined-select/outlined-select.component';
import '../../loading-button/loading-button.component';
import '../../date-input/date-input.component';

import type { OutlinedSelect } from '../../outlined-select/outlined-select.component';

export default function template(this: HolyMassPage) {
  return html`
    ${this.user
      ? html`
          ${load(
            this._bookedHolyMassesPromise,
            (holyMasses) => {
              const dayAlreadyBooked = holyMasses.some(
                ({ date, fraternity: { id } }) =>
                  date.slice(0, 10) === this._selectedDate &&
                  id === this._selectedFraternity,
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
                        dialogAction="selectFraternity"
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
                  </ul>
                  <div class="available-seats">
                    <h4>Posti disponibili</h4>
                    <p>${this._availableSeats ?? '…'}</p>
                  </div>
                  <div class="book-action-bar">
                    <p>
                      ${dayAlreadyBooked
                        ? this.localeData?.massAlreadyBooked
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
                                <th>${this.localeData?.seats}</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${repeat(
                                holyMasses,
                                ({ id }) => id,
                                ({
                                  fraternity: { location },
                                  date,
                                  seats,
                                }) => html`
                                  <tr>
                                    <td>${location}</td>
                                    <td>
                                      ${Intl.DateTimeFormat(this.locale, {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric',
                                      }).format(new Date(date))}
                                    </td>
                                    <td class="right">${seats}</td>
                                  </tr>
                                `,
                              )}
                            </tbody>
                          </table>
                        </div>
                      `
                    : html`<p>${this.localeData?.noSeatsBooked}</p>`}
                </section>
              `;
            },
            (error) => html`${error}`,
          )}
        `
      : html`
          <section>
            <p>
              Per favore, effettua il login per usufruire del servizio di
              prenotazione della Santa Messa
            </p>
          </section>
        `}
  `;
}
