import { html } from 'lit-element';
import { Snackbar } from './snackbar.component';

export default function template(this: Snackbar) {
  return html`
    <div class="text"><slot></slot></div>
    <div class="actions"><slot name="actions"></slot></div>
  `;
}
