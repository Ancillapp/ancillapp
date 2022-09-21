import { html } from 'lit';
import { choose } from 'lit/directives/choose.js';
import { t } from '@lingui/macro';
import { ErrorBox } from './error-box.component';

import '@material/mwc-button';
import '../unobtrusive-notification/unobtrusive-notification.component';

export default function template(this: ErrorBox) {
  return html`
    <unobtrusive-notification>
      ${choose(
        this.error.message,
        [['Failed to fetch', () => this.localize(t`offlineError`)]],
        () => this.localize(t`unexpectedError`),
      )}
      <mwc-button
        slot="actions"
        @click="${() => window.location.reload()}"
        label="${this.localize(t`tryAgain`)}"
        dense
      ></mwc-button>
    </unobtrusive-notification>
  `;
}
