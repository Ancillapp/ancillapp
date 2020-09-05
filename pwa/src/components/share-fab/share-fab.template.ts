import { html } from 'lit-element';
import { ShareFAB } from './share-fab.component';
import { t } from '@lingui/macro';
import { share } from '../icons';

import '../autosized-fab/autosized-fab.component';

export default function template(this: ShareFAB) {
  return html`
    <autosized-fab
      label="${this.localize(t`share`)}"
      @click="${this._handleShare}"
    >
      ${share}
    </autosized-fab>

    <share-menu>
      <share-target-whatsapp></share-target-whatsapp>
      <share-target-telegram></share-target-telegram>
      <share-target-facebook></share-target-facebook>
      <share-target-sms></share-target-sms>
      <share-target-email></share-target-email>
      <share-target-twitter></share-target-twitter>
      <share-target-pinterest></share-target-pinterest>
      <share-target-tumblr></share-target-tumblr>
    </share-menu>
  `;
}
