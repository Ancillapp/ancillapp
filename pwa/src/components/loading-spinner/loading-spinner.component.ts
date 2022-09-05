import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './loading-spinner.styles';
import template from './loading-spinner.template';

@customElement('loading-spinner')
export class LoadingSpinner extends LitElement {
  public static styles = [styles];

  protected render = template;

  @property({ type: Number, reflect: true })
  public size = 2;
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-spinner': LoadingSpinner;
  }
}
