import { html } from 'lit-element';
import { PrayerViewer } from './prayer-viewer.component';
import { load, compile } from '../../helpers/directives';

export default function template(this: PrayerViewer) {
  return html`
    ${load(
      this._prayerPromise,
      ({ title, content }) => html`
        <section>
          <h1>${title}</h1>
          ${compile(content)}
        </section>
      `,
      (error) => html`${error.message}`,
    )}
  `;
}
