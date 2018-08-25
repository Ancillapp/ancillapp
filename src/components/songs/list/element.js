import { PageViewElement } from '../../page-view-element';
import template from './template';

class SongsList extends PageViewElement {
  _render() {
    if (!this._songs) {
      this._songs =
        fetch('/api/songs')
          .then((res) => res.json())
          .then(({ data }) => data);
    }
    return this::template();
  }
}

window.customElements.define('songs-list', SongsList);
