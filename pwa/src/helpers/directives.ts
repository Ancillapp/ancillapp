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

interface SongUltimateGuitarSection {
  type: 'ug';
  content: Song;
}

interface SongABCSection {
  type: 'abc';
  content: string;
}

interface SongRawSection {
  type: 'raw';
  content: string;
}

type SongSection = SongUltimateGuitarSection | SongABCSection | SongRawSection;

const songsParser = new UltimateGuitarParser();
const songsFormatter = new HtmlDivFormatter();
const songsTemplate = document.createElement('template');

const getParagraphClass = (type: string): string => {
  if (/^(?:rit|ritornello|chorus|ref|refrain)[:.]?$/i.test(type)) {
    return 'chorus';
  }
  if (/^bridge[:.]?$/i.test(type)) {
    return 'bridge';
  }
  if (/^(?:finale|fin|fim|ende)[:.]?$/i.test(type)) {
    return 'ending';
  }
  return '';
};

const parseSections = (rawString: string): SongSection[] => {
  const sections = rawString.split('```').filter(Boolean);
  return sections.map((section) => {
    if (section.startsWith('abc')) {
      return {
        type: 'abc',
        content: section.slice(3),
      };
    }
    try {
      const parsedSong = songsParser.parse(section);
      return {
        type: 'ug',
        content: parsedSong,
      };
    } catch {
      return {
        type: 'raw',
        content: section,
      };
    }
  });
};

const htmlCharactersEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeString = (str: string) =>
  str.replace(/[&<>"']/g, (match) => htmlCharactersEscapeMap[match]);

const formatSong = (rawString: string, enableChords = false): string => {
  const parsedSections = parseSections(escapeString(rawString));

  const formattedSections = parsedSections.map((section) => {
    switch (section.type) {
      case 'ug': {
        const formattedSong: string = songsFormatter.format(section.content);
        songsTemplate.innerHTML = formattedSong.trim();
        const element = songsTemplate.content.firstChild as HTMLDivElement;
        element.classList.add('ug');
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
            /^(?:rit|ritornello|chorus|ref|refrain|bridge|finale|fin|fim|ende|\d+)[:.]?\s/gi,
          )?.[0];
          if (paragraphType) {
            initialParagraphLyrics.innerHTML =
              initialParagraphLyrics.innerHTML.replace(
                paragraphType,
                `<strong>${paragraphType}</strong>`,
              );
          }
          const paragraphClass = getParagraphClass(
            paragraphType?.trim() || comment?.innerText.trim() || '',
          );
          if (paragraphClass) {
            paragraph.classList.add(paragraphClass);
          }
        });
        if (!enableChords) {
          element.classList.add('without-chords');
        }
        return element.outerHTML;
      }
      case 'abc': {
        return `<div class="abc" data-content="${section.content.replace(
          /"/g,
          '&quot;',
        )}"></div>`;
      }
      default: {
        return `<div class="raw">${section.content}</div>`;
      }
    }
  });
  return formattedSections.join('');
};

export const renderSong = (rawString: string) =>
  unsafeHTML(formatSong(rawString));
