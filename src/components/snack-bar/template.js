import { html } from '@polymer/lit-element';

import styles from './styles';

export default function template() {
  return html`
    ${styles}
    <div class="text"><slot name="text"></slot></div>
    <div class="actions"><slot name="actions"></slot></div>
  `;
}
