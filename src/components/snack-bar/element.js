import { LitElement } from '@polymer/lit-element';
import template from './template';

class SnackBar extends LitElement {
  static get properties() {
    return {
      active: Boolean,
    };
  }

  _render() {
    return this::template();
  }
}

window.customElements.define('snack-bar', SnackBar);
