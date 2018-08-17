import { html } from '@polymer/lit-element';

import sharedStyles from '../shared-styles';

export default function template({ subroute }) {
  return html`
    ${sharedStyles}
    <ancillas-list class="page" active?="${!subroute}"></ancillas-list>
    <ancilla-page class="page" active?="${subroute}" ancilla="${subroute}"></ancilla-page>
  `;
}
