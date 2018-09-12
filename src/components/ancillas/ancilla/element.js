import { PageViewElement } from '../../page-view-element';
import pdfjs from 'pdfjs-dist';
import template from './template';

class AncillaPage extends PageViewElement {
  static properties = {
    ancilla: String,
  };

  _render() {
    if (!this._ancillaPromises) {
      this._ancillaPromises = {};
      if (!this._ancillaPromises[this.ancilla]) {
        this._ancillaPromises[this.ancilla] =
          fetch(`/api/ancillas/${this.ancilla}`)
            .then((res) => res.json())
            .then(({ data }) => data);
      }
    }
    pdfjs.getDocument(`/api/ancillas/${this.ancilla}`)
      .then(console.log);
    this._ancilla = this._ancillaPromises[this.ancilla];
    return this::template();
  }
}

window.customElements.define('ancilla-page', AncillaPage);
