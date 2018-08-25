import { html } from '@polymer/lit-element';

import sharedStyles from '../shared-styles';

export default function template() {
  return html`
    ${sharedStyles}
    <songs-list class="page" active?="${!this.subroute}"></songs-list>
    <song-page class="page" active?="${this.subroute}" song="${this.subroute}"></song-page>
  `;
}
