import { PageViewElement } from '../page-view-element';
import template from './template';

class SongsPage extends PageViewElement {
  static properties = {
    subroute: String,
  };

  _render(props) {
    if (props.subroute) {
      import('./song/element');
    } else {
      import('./list/element');
    }
    return this::template(props);
  }
}

window.customElements.define('songs-page', SongsPage);
