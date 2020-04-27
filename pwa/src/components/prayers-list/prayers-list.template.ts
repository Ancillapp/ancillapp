import { html } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { PrayersList } from './prayers-list.component';
import { load } from '../../helpers/directives';

export default function template(this: PrayersList) {
  return html`
    ${load(
      this._displayedPrayers,
      (prayers) => html`
        <div class="prayers-container">
          ${prayers.length > 0
            ? repeat(
                prayers,
                ({ slug }) => slug,
                ({ slug, title, image }) => html`
                  <a href="/prayers/${slug}" class="prayer">
                    <div class="image">
                      ${unsafeHTML(image)}
                    </div>
                    <div class="title">${title}</div>
                  </a>
                `,
              )
            : html`<p>${this.localeData?.noResults}</p>`}
        </div>
      `,
      (error) => html`${error.message}`,
    )}
  `;
}
