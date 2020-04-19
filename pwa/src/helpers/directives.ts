import { TemplateResult, html } from 'lit-element';
import { nothing } from 'lit-html';
import { until } from 'lit-html/directives/until';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

export const load = <T>(
  promise: Promise<T>,
  onSuccess: (value: T) => TemplateResult,
  onFailure: (error: Error) => TemplateResult = () => html`${nothing}`,
) => until(promise.then(onSuccess).catch(onFailure), html`<p>Loading...</p>`);

const getParagraphClass = (paragraph: string) => {
  if (/^rit\./i.test(paragraph)) {
    return 'chorus';
  }
  if (/^bridge/i.test(paragraph)) {
    return 'bridge';
  }
  return 'verse';
};

export const song = (rawSong: string) =>
  unsafeHTML(
    rawSong
      .split('\n\n')
      .map(
        (paragraph) =>
          `<p class="${getParagraphClass(paragraph)}">${paragraph.replace(
            /^(rit\.|bridge|\d\.)/i,
            '<strong>$1</strong>',
          )}</p>`,
      )
      .join(''),
  );
