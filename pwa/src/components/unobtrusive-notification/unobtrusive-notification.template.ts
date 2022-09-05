import { html } from 'lit';
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
