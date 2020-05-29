import {
  customElement,
  LitElement,
  property,
  query,
  PropertyValues,
} from 'lit-element';

import styles from './outlined-select.styles';
import template from './outlined-select.template';

@customElement('outlined-select')
export class OutlinedSelect extends LitElement {
  public static styles = styles;

  protected render = template;

  @property({ type: String, attribute: true })
  public value = '';

  @property({ type: Boolean })
  protected _active = false;

  @query('select')
  private _selectRef?: HTMLSelectElement;

  @query('slot')
  private _slotRef?: HTMLSlotElement;

  protected update(changedProperties: PropertyValues) {
    if (this._slotRef && this._selectRef) {
      this._updateOptions();
    }

    super.update(changedProperties);
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this._slotRef!.addEventListener('slotchange', () => this._updateOptions());
  }

  private _updateOptions() {
    const options = this._slotRef!.assignedNodes({ flatten: true }).reduce(
      (opts, node) => {
        if (node.nodeType !== Node.ELEMENT_NODE || node.nodeName !== 'OPTION') {
          return opts;
        }
        return `${opts}${(node as HTMLOptionElement).outerHTML}`;
      },
      '',
    );

    this._selectRef!.innerHTML = options;
    this._selectRef!.value = this.value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'outlined-select': OutlinedSelect;
  }
}
