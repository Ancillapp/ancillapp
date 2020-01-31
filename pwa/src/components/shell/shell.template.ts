import { html } from 'lit-element';
import { Shell } from './shell.component';

import '@material/mwc-top-app-bar';
import '@material/mwc-drawer';

export default function template(this: Shell) {
  return html`
    <mwc-drawer hasHeader type="dismissible">
      <span slot="title">Drawer Title</span>
      <span slot="subtitle">subtitle</span>
      <div>
        <p>Drawer content!</p>
        <mwc-icon-button icon="gesture"></mwc-icon-button>
        <mwc-icon-button icon="gavel"></mwc-icon-button>
      </div>
      <div slot="appContent">
        <mwc-top-app-bar>
          <mwc-icon-button slot="navigationIcon" icon="menu"></mwc-icon-button>
          <div slot="title">${this.localeData?.test}</div>
        </mwc-top-app-bar>
        <div>
          <p>Main Content!</p>
        </div>
      </div>
    </mwc-drawer>
  `;
}
