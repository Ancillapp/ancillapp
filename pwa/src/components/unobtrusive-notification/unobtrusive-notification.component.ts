import { LitElement, customElement } from 'lit-element';

import sharedStyles from '../shared.styles';
import styles from './unobtrusive-notification.styles';
import template from './unobtrusive-notification.template';

@customElement('unobtrusive-notification')
export class UnobtrusiveNotification extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'unobtrusive-notification': UnobtrusiveNotification;
  }
}
