import { customElement, property, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './breviary-index.styles';
import template from './breviary-index.template';

import { apiUrl } from '../../config/default.json';

@customElement('breviary-index')
export class BreviaryIndex extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _date = new Date().toISOString().slice(0, 10);

  @property({ type: Object })
  protected _titlePromise = fetch(
    `${apiUrl}/breviary?prayer=title&date=${this._date}`,
  )
    .then((res) => res.text())
    .then((title) => unsafeHTML(title));

  protected _handleDateChange({ detail: newDate }: CustomEvent<string>) {
    if (!newDate || newDate === this._date) {
      return;
    }

    this._date = newDate;

    this._titlePromise = fetch(
      `${apiUrl}/breviary?prayer=title&date=${this._date}`,
    )
      .then((res) => res.text())
      .then((title) => unsafeHTML(title));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-index': BreviaryIndex;
  }
}
