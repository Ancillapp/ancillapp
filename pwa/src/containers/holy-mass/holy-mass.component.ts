import { customElement, PropertyValues, property } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { authorize } from '../../helpers/authorize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './holy-mass.styles';
import template from './holy-mass.template';

import config from '../../config/default.json';
import { get, set } from '../../helpers/keyval';
import { logEvent } from '../../helpers/firebase';

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
    overrides?: {
      [day: string]: string[];
    };
  };
}

export interface HolyMassBooking {
  id: string;
  fraternity: Fraternity;
  date: string;
  seats: number;
}

@customElement('holy-mass-page')
export class HolyMassPage extends localize(
  authorize(withTopAppBar(PageViewElement)),
) {
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
  protected _selectedDate: string;

  @property({ type: Object })
  protected _bookingToCancel?: HolyMassBooking;

  @property({ type: Boolean })
  protected _verificationEmailSent = false;

  @property({ type: String })
  protected _emailVerificationError?: string;

  @property({ type: String })
  protected _minDate: string;

  protected _maxDate: string;

  constructor() {
    super();

    const now = new Date();
    this._minDate = now.toISOString().slice(0, 10);

    now.setDate(now.getDate() + 3);
    this._maxDate = now.toISOString().slice(0, 10);

    this._selectedDate = this._minDate;

    Promise.all([
      fetch(`${config.apiUrl}/fraternities?v=${Date.now()}`).then((res) =>
        res.json(),
      ),
      get<string | undefined>('preferredFraternity'),
      get<string | undefined>('preferredHolyMassTime'),
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
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`holyMass`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`holyMassDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }

    if (changedProperties.has('user') && this.user) {
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

      this._bookedHolyMassesPromise = this.user
        .getIdToken()
        .then((token) =>
          fetch(`${config.apiUrl}/holy-masses?v=${Date.now()}`, {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
        )
        .then((res) => res.json())
        .then((holyMasses: HolyMassBooking[]) =>
          holyMasses.filter(
            ({ date: dateString }) =>
              this._toLocalTimeZone(new Date(dateString)) > twoHoursAgo,
          ),
        );
    }

    if (
      (changedProperties.has('_selectedFraternity') ||
        changedProperties.has('_selectedDate') ||
        changedProperties.has('_selectedTime')) &&
      this._selectedFraternity &&
      this._selectedDate
    ) {
      this._availableSeats = undefined;

      const availableTimes = this._getAvailableTimes(this._selectedFraternity);

      if (
        (!this._selectedTime || !availableTimes.includes(this._selectedTime)) &&
        availableTimes.length > 0
      ) {
        this._selectedTime = availableTimes[availableTimes.length - 1];
      }

      if (this._selectedTime && availableTimes.length < 1) {
        this._selectedTime = undefined;
      }

      if (!this._selectedTime) {
        return;
      }

      const datetime = this._formatDateTime(
        this._selectedDate,
        this._selectedTime,
      );

      fetch(
        `${config.apiUrl}/fraternities/${
          this._selectedFraternity
        }/holy-masses/${datetime}/seats?v=${Date.now()}`,
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
      `${config.apiUrl}/fraternities/${this._selectedFraternity}/holy-masses/${datetime}`,
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

    logEvent('perform_holy_mass_booking', {
      id,
      date: this._selectedDate,
      time: this._selectedTime,
      seats: this._selectedSeats,
      fraternity: this._selectedFraternity,
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
        `${config.apiUrl}/fraternities/${this._bookingToCancel.fraternity.id}/holy-masses/${this._bookingToCancel.date}`,
        {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const { id } = await res.json();

      const { date, time } = this._parseDateTime(this._bookingToCancel.date);

      logEvent('cancel_holy_mass_booking', {
        id,
        date,
        time,
        seats: this._bookingToCancel.seats,
        fraternity: this._bookingToCancel.fraternity.id,
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
        new Date(
          this._formatDateTime(this._selectedDate, this._selectedTime),
        ).valueOf() === new Date(this._bookingToCancel.date).valueOf()
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
          ? this.localize(t`tooManyVerificationRequests`)
          : this.localize(t`unexpectedError`);
    }
    this._verificationEmailSent = true;
  }

  protected _getAvailableTimes(fraternityId?: string) {
    const fraternityMasses =
      this._fraternities.find(({ id }) => id === fraternityId)?.masses || {};

    const override =
      fraternityMasses.overrides?.[this._selectedDate] ||
      fraternityMasses.overrides?.[this._selectedDate.slice(5)];

    if (override) {
      return override;
    }

    const dayOfWeek = ([
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as Exclude<keyof Fraternity['masses'], 'default' | 'overrides'>[])[
      new Date(this._selectedDate).getDay()
    ];

    const allTimes =
      fraternityMasses[dayOfWeek] || fraternityMasses.default || [];

    const now = new Date();

    return allTimes.filter((time) => {
      const datetime = new Date(this._formatDateTime(this._selectedDate, time));
      const currentTimeZoneDatetime = this._toLocalTimeZone(datetime);

      return now < currentTimeZoneDatetime;
    });
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
