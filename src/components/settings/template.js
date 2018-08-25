import '@material/mwc-checkbox';
import { html } from '@polymer/lit-element';
import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template() {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      <div class="checkbox-container"
        on-click="${() => this.dispatchEvent(new CustomEvent('toggle-dark-theme'))}">
        <label for="dark-theme">${this.localize('dark-theme')}</label>
        <mwc-checkbox id="dark-theme" checked?="${this.darkThemeEnabled}"></mwc-checkbox>
      </div>
    </section>
  `;
}
