import { html } from 'lit-element';
import { SongViewer } from './song-viewer.component';
import { load, compile } from '../../helpers/directives';

export default function template(this: SongViewer) {
  return html`
    ${load(
      this._songPromise,
      ({ number, title, content }) => html`
        <section>
          <h1>${number}. ${title}</h1>
          ${compile(content)}
        </section>
      `,
      (error) => html`${error.message}`,
    )}
  `;
}
