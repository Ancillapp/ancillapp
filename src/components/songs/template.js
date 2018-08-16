import { html } from '@polymer/lit-element';

import sharedStyles from '../shared-styles';

export default function template({ subroute }) {
  return html`
    ${sharedStyles}
    <songs-list class="page" active?="${!subroute}"></songs-list>
    <song-page class="page" active?="${subroute}" song="${subroute}"></song-page>
  `;
}
