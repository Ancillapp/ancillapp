import '@material/mwc-checkbox';
import { html } from '@polymer/lit-element';
import sharedStyles from '../shared-styles';
import styles from './styles';

export default function template() {
  return html`
    ${sharedStyles}
    ${styles}
    <section>
      Le info vanno qui.
    </section>
  `;
}
