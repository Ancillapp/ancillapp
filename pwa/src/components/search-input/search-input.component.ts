import { LitElement, customElement, property, query } from 'lit-element';
import { TextField } from '@material/mwc-textfield';

import sharedStyles from '../shared.styles';
import styles from './search-input.styles';
import template from './search-input.template';

@customElement('search-input')
export class SearchInput extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String, reflect: true })
  public label?: string;

  @property({ type: Boolean })
  protected _numericOnly = true;

  @query('mwc-textfield')
  protected _textfield?: TextField;

  protected _handleSearch({ target }: InputEvent) {
    this.dispatchEvent(
      new CustomEvent('search', {
        bubbles: true,
        detail: (target as HTMLInputElement).value,
      }),
    );
  }

  protected _handleKeyboardTypeSwitch() {
    this._numericOnly = !this._numericOnly;
    this._textfield?.focus();
    this._textfield?.setSelectionRange(-1, -1);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-input': SearchInput;
  }
}
