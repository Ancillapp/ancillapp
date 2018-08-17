import '@material/mwc-checkbox';
import { html } from '@polymer/lit-element';
import sharedStyles from '../../shared-styles';
import styles from './styles';
import { until } from 'lit-html/lib/until';

export default function template({ _ancilla }) {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      ${until(_ancilla.then((ancilla) => html`
        <div>${ancilla}</div>
      `), html`
        <h4>...</h4>
      `)}
    </section>
  `;
}
