import { html } from 'lit-element';
import { cache } from 'lit-html/directives/cache';
import { SongsPage } from './songs.component';

import '../../song-viewer/song-viewer.component';
import '../../songs-list/songs-list.component';

export default function template(this: SongsPage) {
  return html`${cache(
    this.subroute
      ? html`<song-viewer
          ?active="${this.active && this.subroute}"
          song="${this.subroute}"
        ></song-viewer>`
      : html`<songs-list
          ?active="${this.active && !this.subroute}"
        ></songs-list>`,
  )}`;
}
