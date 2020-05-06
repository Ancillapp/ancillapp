import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { BreviaryViewer } from './breviary-viewer.component';
import { load } from '../../helpers/directives';

export default function template(this: BreviaryViewer) {
  return html`
    ${load(
      this._breviaryPromise,
      (content) => html`<section>${unsafeHTML(content)}</section>`,
      (error) => html`${error.message}`,
    )}
  `;
}
