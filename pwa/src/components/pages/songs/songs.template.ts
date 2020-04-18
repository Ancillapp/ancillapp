import { html } from 'lit-element';
import { until } from 'lit-html/directives/until';
import { SongsPage } from './songs.component';

export default function template(this: SongsPage) {
  const subroute = this.subroute
    ? import('../../songs-list/songs-list.component').then(
        () => html`<song-viewer song="${this.subroute}"></song-viewer>`,
      )
    : import('../../songs-list/songs-list.component').then(
        () => html`<songs-list></songs-list>`,
      );

  return until(subroute, html`<p>Loading...</p>`);
}
