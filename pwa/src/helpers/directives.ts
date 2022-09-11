import { TemplateResult, html, nothing } from 'lit';
import { until } from 'lit/directives/until.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { UltimateGuitarParser, HtmlDivFormatter, Song } from 'chordsheetjs';

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

export const renderPrayer = (rawString: string) =>
  unsafeHTML(
    rawString
      .split('\n\n')
      .map(
        (paragraph) =>
          `<p>${paragraph
            .replace(/\n/g, '<br>')
            .replace(
              /^(rit\.|refrain:|bridge|finale|fin\.|ende:|\d\.)/i,
              '<strong>$1</strong>',
            )}</p>`,
      )
      .join(''),
  );

const songsParser = new UltimateGuitarParser();
const songsFormatter = new HtmlDivFormatter();
const songsTemplate = document.createElement('template');

const getParagraphClass = (type: string): string => {
  if (/^(?:rit|refrain)[:.]?$/i.test(type)) {
    return 'chorus';
  }
  if (/^bridge[:.]?$/i.test(type)) {
    return 'bridge';
  }
  if (/^(?:finale|fin|ende)[:.]?$/i.test(type)) {
    return 'ending';
  }
  return '';
};

const parseSong = (rawString: string): Song | string => {
  try {
    const song = songsParser.parse(rawString);
    return song;
  } catch {
    return rawString;
  }
};

const formatSong = (rawString: string, enableChords = false): string => {
  const parsedSong = parseSong(rawString);
  if (typeof parsedSong === 'string') {
    return parsedSong;
  }
  const formatted: string = songsFormatter.format(parsedSong);
  songsTemplate.innerHTML = formatted.trim();
  const element = songsTemplate.content.firstChild as HTMLDivElement;
  const paragraphs = Array.from(element.querySelectorAll('.paragraph'));
  paragraphs.forEach((paragraph) => {
    const comment = paragraph.querySelector<HTMLDivElement>('.comment');
    if (comment) {
      comment.innerHTML = `<strong>${comment.innerHTML}</strong>`;
    }
    const initialParagraphLyrics = paragraph.querySelector(
      '.row > .column > .lyrics',
    );
    const paragraphType = initialParagraphLyrics?.textContent?.match(
      /^(?:rit|refrain|bridge|finale|fin|ende|\d+)[:.]?/gi,
    )?.[0];
    if (paragraphType) {
      initialParagraphLyrics.innerHTML =
        initialParagraphLyrics.innerHTML.replace(
          paragraphType,
          `<strong>${paragraphType}</strong>`,
        );
    }
    const paragraphClass = getParagraphClass(
      paragraphType || comment?.innerText.trim() || '',
    );
    if (paragraphClass) {
      paragraph.classList.add(paragraphClass);
    }
  });
  if (!enableChords) {
    element.classList.add('without-chords');
  }
  return element.outerHTML;
};

export const renderSong = (rawString: string) =>
  unsafeHTML(formatSong(rawString));
