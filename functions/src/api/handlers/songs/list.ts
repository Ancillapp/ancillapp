import { mongoDb } from '../../../helpers/mongo';
import {
  Song,
  SongCategory,
  SongLanguage,
  SongSummary,
} from '../../../models/mongo';

import type { RequestHandler } from 'express';

export interface GetSongsQueryParams {
  fullData?: string;
}

const songCategoriesArray = Object.values(SongCategory);
const songLanguagesArray = Object.values(SongLanguage);

export const getSongs: RequestHandler<
  void,
  Song[] | SongSummary[],
  void,
  GetSongsQueryParams
> = async ({ query: { fullData } }, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const songsCollection = db.collection<Song>('songs');

  const songs: typeof fullData extends string ? Song[] : SongSummary[] =
    await songsCollection
      .find(
        {},
        {
          projection: {
            _id: 0,
            language: 1,
            category: 1,
            number: 1,
            title: 1,
            ...(typeof fullData !== 'undefined' && {
              content: 1,
            }),
          },
        },
      )
      .toArray();

  const sortedSongs = songs.sort((a, b) => {
    if (a.language !== b.language) {
      return (
        songLanguagesArray.indexOf(a.language) -
        songLanguagesArray.indexOf(b.language)
      );
    }

    // If the song language is italian, make sure the categories get properly sorted
    // Note that we already checked for language equality, so the two songs are in the same language.
    // For this reason, we don't need to check also for b.language
    if (a.language === SongLanguage.ITALIAN) {
      const categoriesDiff =
        songCategoriesArray.indexOf(a.category) -
        songCategoriesArray.indexOf(b.category);
      if (categoriesDiff !== 0) {
        return categoriesDiff;
      }
    }

    const normalizedNumberA = a.number.replace('bis', '').padStart(5, '0');
    const normalizedNumberB = b.number.replace('bis', '').padStart(5, '0');

    if (normalizedNumberA.startsWith(normalizedNumberB)) {
      return normalizedNumberA.endsWith('bis') ? -1 : 1;
    }

    return normalizedNumberA.localeCompare(normalizedNumberB);
  });

  res.json(sortedSongs);
};
