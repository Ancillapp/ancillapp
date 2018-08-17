import { PageViewElement } from '../page-view-element';
import template from './template';

class AncillasPage extends PageViewElement {
  static properties = {
    subroute: String,
  };

  _render(props) {
    if (props.subroute) {
      import('./ancilla/element');
    } else {
      import('./list/element');
    }
    return this::template(props);
  }
}

window.customElements.define('ancillas-page', AncillasPage);
