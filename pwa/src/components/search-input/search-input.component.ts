import { LitElement, customElement, property } from 'lit-element';

import sharedStyles from '../shared.styles';
import styles from './search-input.styles';
import template from './search-input.template';

@customElement('search-input')
export class SearchInput extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String, reflect: true })
  public label?: string;

  protected _handleSearch(event: InputEvent) {
    this.dispatchEvent(
      new CustomEvent('search', {
        bubbles: true,
        detail: (event.target as HTMLInputElement).value,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-input': SearchInput;
  }
}
