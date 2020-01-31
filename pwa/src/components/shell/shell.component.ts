import { customElement, LitElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';

import styles from './shell.styles';
import template from './shell.template';

@customElement('ancillapp-shell')
export class Shell extends localize(LitElement) {
  public static styles = styles;

  protected render = template;

  @property({ type: String })
  protected _page = 'chat';
}

declare global {
  interface HTMLElementTagNameMap {
    'gad-shell': Shell;
  }
}
