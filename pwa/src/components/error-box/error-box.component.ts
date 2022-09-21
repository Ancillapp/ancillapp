import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localize } from '../../helpers/localize';

import sharedStyles from '../../shared.styles';
import template from './error-box.template';

@customElement('error-box')
export class ErrorBox extends localize(LitElement) {
  public static styles = [sharedStyles];

  protected render = template;

  @property({ type: Object })
  error!: Error;
}

declare global {
  interface HTMLElementTagNameMap {
    'error-box': ErrorBox;
  }
}
