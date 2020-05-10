import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './breviary-index.styles';
import template from './breviary-index.template';

import type { TextField } from '@material/mwc-textfield';

@customElement('breviary-index')
export class BreviaryIndex extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _date = new Date().toISOString().slice(0, 10);

  protected _handleDateChange({ target }: InputEvent) {
    this._date = (target as TextField).value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-index': BreviaryIndex;
  }
}
