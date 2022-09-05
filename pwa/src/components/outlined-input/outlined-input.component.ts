import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './outlined-input.styles';
import template from './outlined-input.template';

@customElement('outlined-input')
export class OutlinedInput extends LitElement {
  public static styles = styles;

  protected render = template;

  @property({ type: String, reflect: true, attribute: 'input-id' })
  public inputId = `${String.fromCharCode(
    65 + Math.floor(Math.random() * 26),
  )}${Date.now()}`;

  @property({ type: String, attribute: true })
  public value = '';

  @property({ type: String, attribute: true })
  public type = 'text';

  @property({ type: String, attribute: true })
  public label = '';

  @property({ type: String, attribute: true })
  public placeholder = '';

  @property({ type: Boolean, attribute: true })
  public readOnly = false;

  @property({ type: Boolean })
  protected _active = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'outlined-input': OutlinedInput;
  }
}
