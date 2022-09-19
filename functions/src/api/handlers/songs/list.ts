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

const songLanguagesArray = Object.values(SongLanguage);
const songCategoryToPrefixMap: Partial<
  Record<SongLanguage, Partial<Record<SongCategory, string>>>
> = {
  [SongLanguage.ITALIAN]: {
    [SongCategory.KYRIE]: 'A',
    [SongCategory.GLORY]: 'A',
    [SongCategory.HALLELUJAH]: 'A',
    [SongCategory.CREED]: 'A',
    [SongCategory.OFFERTORY]: 'A',
    [SongCategory.HOLY]: 'A',
    [SongCategory.ANAMNESIS]: 'A',
    [SongCategory.AMEN]: 'A',
    [SongCategory.OUR_FATHER]: 'A',
    [SongCategory.LAMB_OF_GOD]: 'A',
    [SongCategory.CANONS_AND_REFRAINS]: 'R',
    [SongCategory.FRANCISCANS]: 'C',
    [SongCategory.PRAISE_AND_FAREWELL]: 'C',
    [SongCategory.ENTRANCE]: 'C',
    [SongCategory.HOLY_SPIRIT]: 'C',
    [SongCategory.WORSHIP]: 'C',
    [SongCategory.EUCHARIST]: 'C',
    [SongCategory.OTHER_SONGS]: 'C',
    [SongCategory.BENEDICTUS]: 'X',
    [SongCategory.MAGNIFICAT]: 'X',
    [SongCategory.CANTICLES]: 'X',
    [SongCategory.HYMNS]: 'N',
    [SongCategory.SIMPLE_PRAYER]: 'C',
    [SongCategory.MARIANS]: 'C',
    [SongCategory.ANIMATION]: 'E',
    [SongCategory.GREGORIANS]: 'O',
    [SongCategory.ADVENT]: 'F',
    [SongCategory.CHRISTMAS]: 'I',
    [SongCategory.LENT]: 'L',
  },
};

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
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const categoriesDiff = songCategoryToPrefixMap[a.language]![
        a.category
      ]!.localeCompare(songCategoryToPrefixMap[b.language]![b.category]!);
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
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
