import { LitElement, html } from '@polymer/lit-element';
import template from './template';

class SnackBar extends LitElement {
  static get properties() {
    return {
      active: Boolean,
    };
  }

  _render(props) {
    return this::template(props);
  }
}

window.customElements.define('snack-bar', SnackBar);
