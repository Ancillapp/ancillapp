import { html } from 'lit-element';
import { UnobtrusiveNotification } from './unobtrusive-notification.component';

export default function template(this: UnobtrusiveNotification) {
  return html`
    <section>
      <slot></slot>
      <div>
        <slot name="actions"></slot>
      </div>
    </section>
  `;
}
