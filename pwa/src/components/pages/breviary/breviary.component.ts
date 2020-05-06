import { customElement, property } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './breviary.styles';
import template from './breviary.template';

@customElement('breviary-page')
export class BreviaryPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  @property({ type: 'String' })
  public subroute?: string;

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-page': BreviaryPage;
  }
}
