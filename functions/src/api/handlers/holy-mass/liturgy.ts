import { validateDate } from '../../../helpers/validators';
import { mongoDb } from '../../../helpers/mongo';
import {
  Liturgy,
  LiturgyContent,
  LiturgyLanguage,
} from '../../../models/mongo';
import { scrapeLiturgy as scrapePTLiturgy } from './liturgy-scrapers/pt';
import { scrapeLiturgy as scrapeITLiturgy } from './liturgy-scrapers/it';
import { scrapeLiturgy as scrapeLiturgyFallback } from './liturgy-scrapers/default';

import type { RequestHandler } from 'express';

export interface GetLiturgyQueryParams {
  date: string;
  language: LiturgyLanguage;
}

const liturgyLanguageToScraperMap: Record<
  LiturgyLanguage,
  (date: Date) => Promise<LiturgyContent>
> = {
  [LiturgyLanguage.ITALIAN]: scrapeITLiturgy,
  [LiturgyLanguage.PORTUGUESE]: scrapePTLiturgy,
  [LiturgyLanguage.GERMAN]: (date) =>
    scrapeLiturgyFallback(date, LiturgyLanguage.GERMAN),
  [LiturgyLanguage.ENGLISH]: (date) =>
    scrapeLiturgyFallback(date, LiturgyLanguage.ENGLISH),
};

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

  const scrape = liturgyLanguageToScraperMap[language];
  const content = await scrape(parsedDate);
  await holyMassesCollection.insertOne({
    date: parsedDate,
    language,
    content,
    createdAt: new Date(),
  });
  res.json(content);
};
