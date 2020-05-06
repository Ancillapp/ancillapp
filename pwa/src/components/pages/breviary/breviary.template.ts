import { html } from 'lit-element';
import { cache } from 'lit-html/directives/cache';
import { BreviaryPage } from './breviary.component';

import '../../breviary-viewer/breviary-viewer.component';
import '../../breviary-index/breviary-index.component';

export default function template(this: BreviaryPage) {
  return html`${cache(
    this.subroute
      ? html`<breviary-viewer
          ?active="${this.active && this.subroute}"
          query="${this.subroute}"
        ></breviary-viewer>`
      : html`<breviary-index
          ?active="${this.active && !this.subroute}"
        ></breviary-index>`,
  )}`;
}
