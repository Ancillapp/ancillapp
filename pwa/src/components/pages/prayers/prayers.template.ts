import { html } from 'lit-element';
import { cache } from 'lit-html/directives/cache';
import { PrayersPage } from './prayers.component';

// import '../../prayer-viewer/prayer-viewer.component';
import '../../prayers-list/prayers-list.component';

export default function template(this: PrayersPage) {
  return html`${cache(
    this.subroute
      ? html`<prayer-viewer prayer="${this.subroute}"></prayer-viewer>`
      : html`<prayers-list></prayers-list>`,
  )}`;
}
