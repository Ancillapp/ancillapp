import { customElement, PropertyValues, property } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { authorize } from '../../../helpers/authorize';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './holy-mass.styles';
import template from './holy-mass.template';

import { apiUrl } from '../../../config/default.json';
import { get, set } from '../../../helpers/keyval';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

export interface Fraternity {
  id: string;
  location: string;
  masses: {
    sunday?: string[];
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    default?: string[];
  };
}

export interface HolyMassBooking {
  id: string;
  fraternity: Fraternity;
  date: string;
  seats: number;
}

@customElement('holy-mass-page')
export class HolyMassPage extends localize(authorize(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Object })
  protected _bookedHolyMassesPromise: Promise<
    HolyMassBooking[]
  > = new Promise(() => []);

  @property({ type: Array })
  protected _fraternities: Fraternity[] = [];

  @property({ type: Boolean })
  protected _bookingHolyMass = false;

  @property({ type: String })
  protected _selectedFraternity?: string;

  @property({ type: String })
  protected _selectedTime?: string;

  @property({ type: Number })
  protected _selectedSeats = 1;

  @property({ type: Number })
  protected _availableSeats?: number;

  @property({ type: String })
  protected _selectedDate = new Date().toISOString().slice(0, 10);

  @property({ type: Object })
  protected _bookingToCancel?: HolyMassBooking;

  @property({ type: Boolean })
  protected _verificationEmailSent = false;

  @property({ type: String })
  protected _emailVerificationError?: string;

  protected _minDate?: string;
  protected _maxDate?: string;

  constructor() {
    super();

    Promise.all<Fraternity[], string | undefined, string | undefined>([
      fetch(`${apiUrl}/fraternities`).then((res) => res.json()),
      get('preferredFraternity'),
      get('preferredHolyMassTime'),
    ]).then(([fraternities, preferredFraternity, preferredHolyMassTime]) => {
      this._fraternities = fraternities;
      this._selectedFraternity =
        preferredFraternity || this._fraternities[0].id;

      const availableTimes = this._getAvailableTimes(this._selectedFraternity);
      this._selectedTime =
        preferredHolyMassTime && availableTimes.includes(preferredHolyMassTime)
          ? preferredHolyMassTime
          : availableTimes[availableTimes.length - 1];
    });

    const now = new Date();
    this._minDate = now.toISOString().slice(0, 10);

    now.setDate(now.getDate() + 7);
    this._maxDate = now.toISOString().slice(0, 10);
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('user') && this.user) {
      this._bookedHolyMassesPromise = this.user
        .getIdToken()
        .then((token) =>
          fetch(`${apiUrl}/holy-masses`, {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
        )
        .then((res) => res.json());
    }

    if (
      (changedProperties.has('_selectedFraternity') ||
        changedProperties.has('_selectedDate') ||
        changedProperties.has('_selectedTime')) &&
      this._selectedFraternity &&
      this._selectedDate &&
      this._selectedTime
    ) {
      this._availableSeats = undefined;

      if (!changedProperties.has('_selectedTime')) {
        const availableTimes = this._getAvailableTimes(
          this._selectedFraternity,
        );

        if (!availableTimes.includes(this._selectedTime)) {
          this._selectedTime = availableTimes[availableTimes.length - 1];
        }
      }

      const datetime = this._formatDateTime(
        this._selectedDate,
        this._selectedTime,
      );

      fetch(
        `${apiUrl}/fraternities/${this._selectedFraternity}/holy-masses/${datetime}/seats`,
      )
        .then((res) => res.json())
        .then((availableSeats) => (this._availableSeats = availableSeats));
    }
  }

  protected async _bookHolyMassSeat() {
    if (
      !this._selectedFraternity ||
      !this._selectedDate ||
      !this._selectedTime ||
      !this.user
    ) {
      return;
    }

    this._bookingHolyMass = true;

    await set('preferredFraternity', this._selectedFraternity);
    await set('preferredHolyMassTime', this._selectedTime);

    const token = await this.user.getIdToken();

    const datetime = this._formatDateTime(
      this._selectedDate,
      this._selectedTime,
    );

    const res = await fetch(
      `${apiUrl}/fraternities/${this._selectedFraternity}/holy-masses/${datetime}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          seats: this._selectedSeats,
        }),
      },
    );
    const { id } = await res.json();

    analytics.logEvent('perform_holy_mass_booking', {
      id,
      date: this._selectedDate,
      time: this._selectedTime,
      seats: this._selectedSeats,
      fraternity: this._selectedFraternity,
      offline: false,
    });

    this.requestUpdate('_selectedFraternity', this._selectedFraternity);
    this._bookedHolyMassesPromise = this._bookedHolyMassesPromise.then(
      (bookedHolyMasses) => {
        const newRecord = {
          id,
          date: datetime,
          seats: this._selectedSeats,
          fraternity: this._fraternities.find(
            ({ id }) => id === this._selectedFraternity,
          )!,
        };

        let index = 0;

        while (
          index < bookedHolyMasses.length &&
          bookedHolyMasses[index].date > newRecord.date
        ) {
          index++;
        }

        bookedHolyMasses.splice(index, 0, newRecord);

        return bookedHolyMasses;
      },
    );
    this._availableSeats! -= this._selectedSeats;

    this._bookingHolyMass = false;
  }

  protected async _cancelHolyMassSeatsBooking({
    detail: { action },
  }: CustomEvent<{ action: string }>) {
    if (action === 'cancelBooking') {
      if (!this._bookingToCancel || !this.user) {
        return;
      }

      const token = await this.user.getIdToken();

      const res = await fetch(
        `${apiUrl}/fraternities/${this._bookingToCancel.fraternity.id}/holy-masses/${this._bookingToCancel.date}`,
        {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const { id } = await res.json();

      const { date, time } = this._parseDateTime(this._bookingToCancel.date);

      analytics.logEvent('cancel_holy_mass_booking', {
        id,
        date,
        time,
        seats: this._bookingToCancel.seats,
        fraternity: this._bookingToCancel.fraternity.id,
        offline: false,
      });

      this.requestUpdate('_selectedFraternity', this._selectedFraternity);
      this._bookedHolyMassesPromise = this._bookedHolyMassesPromise.then(
        (bookedHolyMasses) => {
          bookedHolyMasses.splice(
            bookedHolyMasses.findIndex((booking) => booking.id === id),
            1,
          );

          return bookedHolyMasses;
        },
      );

      if (
        this._selectedFraternity === this._bookingToCancel.fraternity.id &&
        this._formatDateTime(this._selectedDate, this._selectedTime) ===
          this._bookingToCancel.date
      ) {
        this._availableSeats! += this._bookingToCancel.seats;
      }
    }

    this._bookingToCancel = undefined;
  }

  protected _handleDateChange({ detail: newDate }: CustomEvent<string>) {
    if (!newDate || newDate === this._selectedDate) {
      return;
    }

    this._selectedDate = newDate;
  }

  protected async _sendVerificationEmail() {
    if (!this.user || this.user.emailVerified) {
      return;
    }

    try {
      await this.user.sendEmailVerification({
        url: window.location.href,
      });
    } catch ({ code }) {
      this._emailVerificationError =
        code === 'auth/too-many-requests'
          ? 'Hai effettuato troppe richieste di verifica email, riprova più tardi.'
          : "C'è stato un errore non previsto, riprova più tardi.";
    }
    this._verificationEmailSent = true;
  }

  protected _getAvailableTimes(fraternityId?: string) {
    const fraternityMasses =
      this._fraternities.find(({ id }) => id === fraternityId)?.masses || {};

    const dayOfWeek = ([
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as (keyof Fraternity['masses'])[])[new Date(this._selectedDate).getDay()];

    return fraternityMasses[dayOfWeek] || fraternityMasses.default || [];
  }

  protected _formatDateTime(date: string, time?: string) {
    return `${date}T${time?.padStart(5, '0')}Z`;
  }

  protected _parseDateTime(encodedDateTime: string) {
    const [, date, time] =
      encodedDateTime.match(/(\d{4}-\d{2}-\d{2})T0*([\d]+:[\d]+)/) || [];

    return { date, time };
  }

  protected _toLocalTimeZone(date: Date) {
    const todayInCurrentTimeZone = new Date();

    date.setHours(
      date.getHours() + todayInCurrentTimeZone.getTimezoneOffset() / 60,
    );

    return date;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'holy-mass-page': HolyMassPage;
  }
}
