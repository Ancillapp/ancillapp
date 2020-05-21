import { customElement, PropertyValues, property } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { authorize } from '../../../helpers/authorize';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './holy-mass.styles';
import template from './holy-mass.template';

import { apiUrl } from '../../../config/default.json';
import { get, set } from '../../../helpers/keyval';

export interface Fraternity {
  id: string;
  location: string;
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

  @property({ type: Number })
  protected _selectedSeats = 1;

  @property({ type: Number })
  protected _availableSeats?: number;

  @property({ type: String })
  protected _selectedDate = new Date().toISOString().slice(0, 10);

  protected _minDate?: string;
  protected _maxDate?: string;

  constructor() {
    super();

    Promise.all<Fraternity[], string | undefined>([
      fetch(`${apiUrl}/fraternities`).then((res) => res.json()),
      get('preferredFraternity'),
    ]).then(([fraternities, preferredFraternity]) => {
      this._fraternities = fraternities;
      this._selectedFraternity =
        preferredFraternity || this._fraternities[0].id;
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
        changedProperties.has('_selectedDate')) &&
      this._selectedFraternity &&
      this._selectedDate
    ) {
      this._availableSeats = undefined;

      fetch(
        `${apiUrl}/fraternities/${this._selectedFraternity}/holy-masses/${this._selectedDate}/seats`,
      )
        .then((res) => res.json())
        .then((availableSeats) => (this._availableSeats = availableSeats));
    }
  }

  protected async _bookHolyMassSeat() {
    if (
      !this._selectedFraternity ||
      !this._selectedDate ||
      !this._selectedDate ||
      !this.user
    ) {
      return;
    }

    this._bookingHolyMass = true;

    await set('preferredFraternity', this._selectedFraternity);

    const token = await this.user.getIdToken();

    const res = await fetch(
      `${apiUrl}/fraternities/${this._selectedFraternity}/holy-masses/${this._selectedDate}`,
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
    await res.blob();

    this.requestUpdate('_selectedFraternity', this._selectedFraternity);
    this._bookedHolyMassesPromise = this._bookedHolyMassesPromise.then(
      (bookedHolyMasses) => [
        {
          id: btoa(Date.now().toString()),
          date: this._selectedDate,
          seats: this._selectedSeats,
          fraternity: this._fraternities.find(
            ({ id }) => id === this._selectedFraternity,
          )!,
        },
        ...bookedHolyMasses,
      ],
    );
    this._availableSeats! -= this._selectedSeats;

    this._bookingHolyMass = false;
  }

  protected _handleDateChange({ detail: newDate }: CustomEvent<string>) {
    if (!newDate || newDate === this._selectedDate) {
      return;
    }

    this._selectedDate = newDate;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'holy-mass-page': HolyMassPage;
  }
}
