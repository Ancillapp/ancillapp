import { html, nothing } from 'lit';
import { AutosizedFAB } from './autosized-fab.component';

import 'mdui/components/fab.js';
import '../ancillapp-icon.component.js';

export default function template(this: AutosizedFAB) {
  return html`
    <mdui-fab
      size="normal"
      ?disabled="${this.disabled}"
      ?extended="${!this._scrolling}"
    >
      ${this.icon
        ? html`
            <ancillapp-icon name="${this.icon}" slot="icon"></ancillapp-icon>
          `
        : nothing}
      ${this.label || nothing}
    </mdui-fab>
  `;
}
