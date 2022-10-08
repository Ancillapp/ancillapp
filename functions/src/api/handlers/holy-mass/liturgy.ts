import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
import { validateDate } from '../../../helpers/validators';
import { mongoDb } from '../../../helpers/mongo';
import {
  Liturgy,
  LiturgyContent,
  LiturgyLanguage,
  LiturgySection,
} from '../../../models/mongo';
import { scrapeLiturgy as scrapePTLiturgy } from './liturgy-scrapers/pt';
import { scrapeLiturgy as scrapeITLiturgy } from './liturgy-scrapers/it';

import type { RequestHandler } from 'express';

export interface GetLiturgyQueryParams {
  date: string;
  language: LiturgyLanguage;
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
  LiturgyContent,
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

  const db = await mongoDb;
  const holyMassesCollection = db.collection<Liturgy>('holyMasses');

  const cachedHolyMass = await holyMassesCollection.findOne({
    date: parsedDate,
    language,
  });

  if (cachedHolyMass) {
    res.json(cachedHolyMass.content);
    return;
  }

  switch (language) {
    case LiturgyLanguage.PORTUGUESE: {
      const content = await scrapePTLiturgy(parsedDate);
      await holyMassesCollection.insertOne({
        date: parsedDate,
        language,
        content,
        createdAt: new Date(),
      });
      res.json(content);
      return;
    }
    case LiturgyLanguage.ITALIAN: {
      const content = await scrapeITLiturgy(parsedDate);
      await holyMassesCollection.insertOne({
        date: parsedDate,
        language,
        content,
        createdAt: new Date(),
      });
      res.json(content);
      return;
    }
  }

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
