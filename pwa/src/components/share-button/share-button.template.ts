import { html } from 'lit-element';
import { ShareButton } from './share-button.component';

import '@material/mwc-fab';
import { share } from '../icons';

export default function template(this: ShareButton) {
  return html`
    <mwc-fab
      ?mini="${this._mini}"
      label="${this.localeData?.share}"
      @click="${this._handleShare}"
    >
      <div slot="icon">
        ${share}
      </div>
    </mwc-fab>

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
