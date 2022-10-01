import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
import { validateDate } from '../../../helpers/validators';

import type { RequestHandler } from 'express';

export enum LiturgyLanguage {
  ITALIAN = 'it',
  GERMAN = 'de',
  PORTUGUESE = 'pt',
  ENGLISH = 'en',
}

export interface LiturgySection {
  title?: string;
  subtitle?: string;
  sections?: string[] | LiturgySection[];
}

export interface GetLiturgyQueryParams {
  language: LiturgyLanguage;
  date: string;
}

export interface GetLiturgyResult {
  sections: LiturgySection[];
}

const apiBaseUrl = 'https://www.vaticannews.va';

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

export const getLiturgy: RequestHandler<
  void,
  GetLiturgyResult,
  void,
  GetLiturgyQueryParams
> = async ({ query: { language, date } }, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  if (!validateDate(date)) {
    res.status(400).send();
    return;
  }

  const parsedDate = new Date(date);

  const response = await fetch(
    `${apiBaseUrl}/${localizedUrlsMap[language]}/${formatDate(
      parsedDate,
    )}.html`,
  );
  const rawHtml = await response.text();

  const { window } = new JSDOM(rawHtml);
  const { document } = window;

  const rawSections = Array.from(
    document.querySelectorAll('main.content section.section--isStatic'),
  );
  const sections: LiturgySection[] = rawSections.map((section) => {
    const title = section?.querySelector('.section__head')?.textContent?.trim();

    // const subsections: LiturgySection[] = [];
    const rawSubsections = Array.from(
      section.querySelectorAll('.section__wrapper > .section__content > p'),
    );

    const subsections = rawSubsections
      .flatMap((rawSubsection) => {
        const brFreeSection =
          rawSubsection.innerHTML?.replace(/\s*<br>\s*/g, '\n') || '';
        return sanitizeHtml(brFreeSection, {
          allowedTags: [],
        }).trim();
      })
      .filter(Boolean);

    return {
      title,
      sections: subsections,
    };
  });

  res.json({
    sections,
  });
};
