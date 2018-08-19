import { PageViewElement } from '../../page-view-element';
import template from './template';

class AncillaPage extends PageViewElement {
  static properties = {
    ancilla: String,
  };

  _render(props) {
    if (!this._ancillaPromises) {
      this._ancillaPromises = {};
      if (!this._ancillaPromises[props.ancilla]) {
        this._ancillaPromises[props.ancilla] =
          fetch(`/api/ancillas/${props.ancilla}`)
            .then((res) => res.json())
            .then(({ data }) => data);
      }
    }
    return this::template({
      ...props,
      _ancilla: this._ancillaPromises[props.ancilla],
    });
  }
}

window.customElements.define('ancilla-page', AncillaPage);
