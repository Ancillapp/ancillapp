import { customElement, LitElement, property } from 'lit-element';

import styles from './snackbar.styles';
import template from './snackbar.template';

@customElement('snack-bar')
export class Snackbar extends LitElement {
  public static styles = styles;

  protected render = template;

  @property({ type: Boolean, attribute: true })
  public active = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'snack-bar': Snackbar;
  }
}
