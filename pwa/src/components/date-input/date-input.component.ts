import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dateConverter } from '../../helpers/converters';
import { toLocalTimeZone } from '../../helpers/utils';

import sharedStyles from '../../shared.styles';
import styles from './date-input.styles';
import template from './date-input.template';

@customElement('date-input')
export class DateInput extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String, reflect: true })
  public label = '';

  @property({ converter: dateConverter, reflect: true })
  public value: Date | null = null;

  @property({ type: String, reflect: true })
  public min = '1900-01-01';

  @property({ type: String, reflect: true })
  public max = '2100-12-31';

  protected _handleDateChange({ detail }: CustomEvent<string>) {
    const detailAsDate = toLocalTimeZone(new Date(detail));

    if (detailAsDate === this.value) {
      return;
    }

    this.value = detailAsDate;

    this.dispatchEvent(new CustomEvent('change', { detail: detailAsDate }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'date-input': DateInput;
  }
}
