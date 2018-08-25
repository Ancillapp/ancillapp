import '@material/mwc-checkbox';
import { html } from '@polymer/lit-element';
import sharedStyles from '../../shared-styles';
import styles from './styles';
import { until } from 'lit-html/lib/until';

export default function template() {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      ${until(this._song.then((song) => html`
        <div class="settings">
          <div style="cursor: pointer; display: flex; align-items: center;" on-click="${() => this._toggleChords()}">
            <label for="show-chords">${this.localize('show-chords')}</label>
            <mwc-checkbox id="show-chords" checked?="${this._showChords}"></mwc-checkbox>
          </div>
          <div hidden?="${!this._showChords}">
            <label id="transpose-label">${this.localize('transpose')}</label>
            <button aria-labelledby="transpose-label"
              on-click="${() => this._transposeDelta = Math.max(-11, this._transposeDelta - 1)}">-</button>
            <span>${this._transposeDelta}</span>
            <button aria-labelledby="transpose-label"
              on-click="${() => this._transposeDelta = Math.min(11, this._transposeDelta + 1)}">+</button>
          </div>
        </div>
        ${song.html}
      `), html`
        <h4>...</h4>
      `)}
    </section>
  `;
}
