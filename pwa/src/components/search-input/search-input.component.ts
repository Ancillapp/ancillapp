import { LitElement, customElement, property, query } from 'lit-element';
import { TextField } from '@material/mwc-textfield';
import { get, set } from '../../helpers/keyval';

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
  protected _numericOnly = false;

  @query('mwc-textfield')
  protected _textfield?: TextField;

  constructor() {
    super();

    get<boolean>('prefersNumericSearchKeyboard').then(
      (prefersNumericSearchKeyboard) =>
        (this._numericOnly = prefersNumericSearchKeyboard),
    );
  }

  protected _handleSearch({ target }: InputEvent) {
    this.dispatchEvent(
      new CustomEvent('search', {
        bubbles: true,
        detail: (target as HTMLInputElement).value,
      }),
    );
  }

  protected async _handleKeyboardTypeSwitch() {
    this._numericOnly = !this._numericOnly;
    this._textfield?.focus();
    this._textfield?.setSelectionRange(-1, -1);
    await set('prefersNumericSearchKeyboard', this._numericOnly);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-input': SearchInput;
  }
}
