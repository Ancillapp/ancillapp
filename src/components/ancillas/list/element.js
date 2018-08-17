import { PageViewElement } from '../../page-view-element';
import template from './template';

class AncillasList extends PageViewElement {
  _render(props) {
    if (!this._ancillas) {
      this._ancillas =
        fetch('/api/ancillas')
          .then((res) => res.json())
          .then(({ data }) => data);
    }
    return this::template({
      ...props,
      _ancillas: this._ancillas,
    });
  }
}

window.customElements.define('ancillas-list', AncillasList);
