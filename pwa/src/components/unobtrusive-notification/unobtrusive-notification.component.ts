import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import sharedStyles from '../../shared.styles.scss';
import styles from './unobtrusive-notification.styles.scss';
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
