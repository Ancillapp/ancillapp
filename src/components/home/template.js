import { html } from '@polymer/lit-element';
import sharedStyles from '../shared-styles';
import styles from './styles';
import { ancillaIcon, breviaryIcon, prayersIcon, songsIcon } from '../icons';

export default function template({ _today }) {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      <h2>Pace e Bene!</h2>
      <ul>
          <li>
        <a href="/breviary/${_today}">
            <span>Prega la Liturgia delle Ore</span>
            ${breviaryIcon}
        </a>
          </li>
          <li>
        <a href="/prayers">
            <span>Prega le preghiere giornaliere</span>
            ${prayersIcon}
        </a>
          </li>
          <li>
        <a href="/songs">
            <span>Canta i canti della Fraternità</span>
            ${songsIcon}
        </a>
          </li>
          <li>
        <a href="/ancilla">
            <span>Sfoglia l'ultimo Ancilla Domini</span>
            ${ancillaIcon}
        </a>
          </li>
      </ul>
    </section>
  `;
}
