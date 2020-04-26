import { LitElement, customElement, property } from 'lit-element';

import sharedStyles from '../shared.styles';
import { style } from '@material/mwc-icon-button/mwc-icon-button-css';
import template from './icon-button.template';

@customElement('icon-button')
export class IconButton extends LitElement {
  public static styles = [sharedStyles, style];

  protected render = template;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @property({ type: String })
  public icon = '';

  @property({ type: String })
  public label = '';
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-button': IconButton;
  }
}
