import { LitElement, customElement, property, query } from 'lit-element';

import sharedStyles from '../../shared.styles';
import styles from './date-input.styles';
import template from './date-input.template';

import type {
  DatepickerDialog,
  DatepickerDialogClosed,
} from 'app-datepicker/dist/datepicker-dialog';

@customElement('date-input')
export class DateInput extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String, reflect: true })
  public label = '';

  @property({ type: String, reflect: true, attribute: 'set-label' })
  public setLabel = 'Set';

  @property({ type: String, reflect: true, attribute: 'cancel-label' })
  public cancelLabel = 'Cancel';

  @property({ type: String, reflect: true })
  public locale = 'it';

  @property({ type: String, reflect: true })
  public value?: string;

  @property({ type: String, reflect: true })
  public min = '1900-01-01';

  @property({ type: String, reflect: true })
  public max = '2100-12-31';

  @query('app-datepicker-dialog')
  protected _datepickerDialog?: DatepickerDialog;

  protected _handleTextfieldClick(event: Event) {
    event.preventDefault();
    this._datepickerDialog!.open();
  }

  protected _handleDateChange({
    detail: { value },
  }: CustomEvent<DatepickerDialogClosed>) {
    if (!value || value === this.value) {
      return;
    }

    this.value = value;

    this.dispatchEvent(new CustomEvent('change', { detail: value }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'date-input': DateInput;
  }
}
