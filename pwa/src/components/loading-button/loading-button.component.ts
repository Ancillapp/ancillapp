import { LitElement, customElement, property } from 'lit-element';

import sharedStyles from '../../shared.styles';
import styles from './loading-button.styles';
import template from './loading-button.template';

@customElement('loading-button')
export class LoadingButton extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean }) loading = false;

  @property({ type: Boolean }) raised = false;

  @property({ type: Boolean }) unelevated = false;

  @property({ type: Boolean }) outlined = false;

  @property({ type: Boolean }) dense = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean, attribute: 'trailingicon' }) trailingIcon = false;

  @property({ type: Boolean, reflect: true }) fullwidth = false;

  @property({ type: String }) icon = '';

  @property({ type: String }) label = '';
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-button': LoadingButton;
  }
}
