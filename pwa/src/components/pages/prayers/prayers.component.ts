import { customElement, property } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './prayers.styles';
import template from './prayers.template';

@customElement('prayers-page')
export class PrayersPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  @property({ type: 'String' })
  public subroute?: string;

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-page': PrayersPage;
  }
}
