import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './prayers-list.styles';
import template from './prayers-list.template';

import { apiUrl } from '../../config/default.json';

export interface PrayerSummary {
  slug: string;
  title: string;
  image: string;
}

@customElement('prayers-list')
export class PrayersList extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected _prayers: Promise<PrayerSummary[]> = fetch(
    `${apiUrl}/prayers`,
  ).then((res) => res.json());

  @property({ type: Object })
  protected _displayedPrayers: Promise<PrayerSummary[]> = this._prayers;

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-list': PrayersList;
  }
}
