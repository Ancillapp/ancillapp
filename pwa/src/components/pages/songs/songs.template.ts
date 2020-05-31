import { html } from 'lit-element';
import { SongsPage } from './songs.component';

import '../../song-viewer/song-viewer.component';
import '../../songs-list/songs-list.component';

export default function template(this: SongsPage) {
  return html`
    <song-viewer
      class="page"
      ?active="${this.active && this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      song="${this.subroute}"
    ></song-viewer>
    <songs-list
      class="page"
      ?active="${this.active && !this.subroute}"
      ?drawer-open="${this.drawerOpen}"
      @menutoggle="${(event: CustomEvent) =>
        this.dispatchEvent(new CustomEvent(event.type, event))}"
    ></songs-list>
  `;
}
