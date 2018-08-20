import { ancillasIcon, breviaryIcon, prayersIcon, songsIcon } from '../icons';
import { html } from '@polymer/lit-element';
import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template({ _today }) {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      <h2>${this.localize('peace-and-good')}</h2>
      <ul>
          <li>
        <a href="/breviary/${_today}">
            <span>${this.localize('pray-liturgy')}</span>
            ${breviaryIcon}
        </a>
          </li>
          <li>
        <a href="/prayers">
            <span>${this.localize('pray-daily-prayers')}</span>
            ${prayersIcon}
        </a>
          </li>
          <li>
        <a href="/songs">
            <span>${this.localize('sing-fraternity-songs')}</span>
            ${songsIcon}
        </a>
          </li>
          <li>
        <a href="/ancillas/latest">
            <span>${this.localize('read-latest-ancilla')}</span>
            ${ancillasIcon}
        </a>
          </li>
      </ul>
    </section>
  `;
}
