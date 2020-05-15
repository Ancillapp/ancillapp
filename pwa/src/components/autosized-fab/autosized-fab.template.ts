import { html } from 'lit-element';
import { AutosizedFAB } from './autosized-fab.component';

import '@material/mwc-fab';
import * as icons from '../icons';

export default function template(this: AutosizedFAB) {
  return html`
    <mwc-fab
      ?mini="${this._mini}"
      ?disabled="${this.disabled}"
      ?extended="${this.extended}"
      label="${this.label || this.icon}"
    >
      <div slot="icon">
        ${icons[this.icon as keyof typeof icons]}
      </div>
    </mwc-fab>
  `;
}
