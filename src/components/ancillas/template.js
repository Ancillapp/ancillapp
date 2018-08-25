import { html } from '@polymer/lit-element';

import sharedStyles from '../shared-styles';

export default function template() {
  return html`
    ${sharedStyles}
    <ancillas-list class="page" active?="${!this.subroute}"></ancillas-list>
    <ancilla-page class="page" active?="${this.subroute}" ancilla="${this.subroute}"></ancilla-page>
  `;
}
