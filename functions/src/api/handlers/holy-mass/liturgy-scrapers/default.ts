import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import {
  LiturgyContent,
  LiturgyLanguage,
  LiturgySection,
} from '../../../../models/mongo';
import { dropHtml } from './helpers';

const API_URL = 'https://www.vaticannews.va';

const localizedUrlsMap: Record<LiturgyLanguage, string> = {
  [LiturgyLanguage.ITALIAN]: 'it/vangelo-del-giorno-e-parola-del-giorno',
  [LiturgyLanguage.GERMAN]: 'de/tagesevangelium-und-tagesliturgie',
  [LiturgyLanguage.PORTUGUESE]: 'pt/palavra-do-dia',
  [LiturgyLanguage.ENGLISH]: 'en/word-of-the-day',
};

const formatDate = (date: Date) =>
  [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
  ].join('/');

export const scrapeLiturgy = async (
  date: Date,
  language: LiturgyLanguage,
): Promise<LiturgyContent> => {
  const response = await fetch(
    `${API_URL}/${localizedUrlsMap[language]}/${formatDate(date)}.html`,
  );
  const rawHtml = await response.text();

  const { window } = new JSDOM(rawHtml);
  const { document } = window;

  const rawSections = Array.from(
    document.querySelectorAll('main.content section.section--isStatic'),
  );
  const sections: LiturgySection[] = rawSections.map((section) => {
    const title = section?.querySelector('.section__head')?.textContent?.trim();

    const rawSubsections = Array.from(
      section.querySelectorAll('.section__wrapper > .section__content > p'),
    );

    const subsections = rawSubsections
      .flatMap((rawSubsection) => {
        const brFreeSection =
          rawSubsection.innerHTML?.replace(/\s*<br>\s*/g, '\n') || '';
        return dropHtml(brFreeSection);
      })
      .filter(Boolean);

    return {
      title,
      sections: subsections,
    };
  });

  return { sections };
};
