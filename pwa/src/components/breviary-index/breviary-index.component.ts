import { customElement, property, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './breviary-index.styles';
import template from './breviary-index.template';

import type {
  DatepickerDialog,
  DatepickerDialogClosed,
} from 'app-datepicker/dist/datepicker-dialog';

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

  @query('app-datepicker-dialog')
  protected _datepickerDialog?: DatepickerDialog;

  protected _handleTextfieldClick(event: Event) {
    event.preventDefault();
    console.log(this._datepickerDialog.constructor);
    this._datepickerDialog!.open();
  }

  protected _handleDateChange({
    detail: { value },
  }: CustomEvent<DatepickerDialogClosed>) {
    if (!value || value === this._date) {
      return;
    }

    this._date = value;

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
