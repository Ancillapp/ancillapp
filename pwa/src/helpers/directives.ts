import { TemplateResult, html, nothing } from 'lit';
import { until } from 'lit/directives/until.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../components/loading-spinner/loading-spinner.component';

export const load = <T>(
  promise: Promise<T>,
  onSuccess: (value: T) => TemplateResult,
  onFailure: (error: Error) => TemplateResult = () => html`${nothing}`,
) =>
  until(
    promise.then(onSuccess).catch(onFailure),
    html`<div class="loading-container">
      <loading-spinner></loading-spinner>
    </div>`,
  );

const getParagraphClass = (paragraph: string) => {
  if (/^(?:rit\.|refrain:)/i.test(paragraph)) {
    return 'chorus';
  }
  if (/^bridge/i.test(paragraph)) {
    return 'bridge';
  }
  if (/^(?:finale|fin\.|ende:)/i.test(paragraph)) {
    return 'ending';
  }
  return 'verse';
};

export const compile = (rawString: string) =>
  unsafeHTML(
    rawString
      .split('\n\n')
      .map(
        (paragraph) =>
          `<p class="${getParagraphClass(paragraph)}">${paragraph
            .replace(/\n/g, '<br>')
            .replace(
              /^(rit\.|refrain:|bridge|finale|fin\.|ende:|\d\.)/i,
              '<strong>$1</strong>',
            )}</p>`,
      )
      .join(''),
  );
