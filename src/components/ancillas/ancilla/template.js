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
      ${until(this._ancilla.then((ancilla) => html`
        <div>${ancilla}</div>
      `), html`
        <h4>...</h4>
      `)}
    </section>
  `;
}
