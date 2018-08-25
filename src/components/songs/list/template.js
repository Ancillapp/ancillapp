import { html } from '@polymer/lit-element';
import { repeat } from 'lit-html/lib/repeat';
import sharedStyles from '../../shared-styles';
import styles from './styles';
import { until } from 'lit-html/lib/until';

export default function template() {
  return html`
    ${sharedStyles}
    ${styles}
    ${until(this._songs.then((songs) => html`
      <div class="songs-container">
        ${repeat(songs, (s) => s.number, (s) => html`
          <a href="/songs/${s.number}" class="song">
            <div class="number">${s.number}</div>
            <div class="title">${s.title}</div>
          </a>
        `)}
      </div>
    `), html`
      <h4>...</h4>
    `)}
  `;
}
