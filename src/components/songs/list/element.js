import { PageViewElement } from '../../page-view-element';
import template from './template';

class SongsList extends PageViewElement {
  _render(props) {
    if (!this._songs) {
      this._songs =
        fetch('/api/songs')
          .then((res) => res.json());
    }
    return this::template({
      ...props,
      _songs: this._songs,
    });
  }
}

window.customElements.define('songs-list', SongsList);
