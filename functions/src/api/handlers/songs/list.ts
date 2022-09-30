import { mongoDb } from '../../../helpers/mongo';
import {
  Song,
  SongCategory,
  SongLanguage,
  SongMacroCategory,
  SongSummary,
} from '../../../models/mongo';

import type { RequestHandler } from 'express';

export interface GetSongsQueryParams {
  fullData?: string;
}

const songLanguagesArray = Object.values(SongLanguage);
const songCategoryToMacroCategoryMap: Partial<
  Record<SongLanguage, Partial<Record<SongCategory, SongMacroCategory>>>
> = {
  [SongLanguage.ITALIAN]: {
    [SongCategory.KYRIE]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.GLORY]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.HALLELUJAH]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.CREED]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.OFFERTORY]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.HOLY]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.ANAMNESIS]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.AMEN]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.OUR_FATHER]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.LAMB_OF_GOD]: SongMacroCategory.ORDINARIUM_MISSAE,
    [SongCategory.CANONS_AND_REFRAINS]: SongMacroCategory.CANONS_AND_REFRAINS,
    [SongCategory.FRANCISCANS]: SongMacroCategory.SONGS,
    [SongCategory.PRAISE_AND_FAREWELL]: SongMacroCategory.SONGS,
    [SongCategory.ENTRANCE]: SongMacroCategory.SONGS,
    [SongCategory.HOLY_SPIRIT]: SongMacroCategory.SONGS,
    [SongCategory.WORSHIP]: SongMacroCategory.SONGS,
    [SongCategory.EUCHARIST]: SongMacroCategory.SONGS,
    [SongCategory.OTHER_SONGS]: SongMacroCategory.SONGS,
    [SongCategory.VENI_CREATOR]: SongMacroCategory.LITURGY_OF_THE_HOURS,
    [SongCategory.BENEDICTUS]: SongMacroCategory.LITURGY_OF_THE_HOURS,
    [SongCategory.MAGNIFICAT]: SongMacroCategory.LITURGY_OF_THE_HOURS,
    [SongCategory.CANTICLES]: SongMacroCategory.LITURGY_OF_THE_HOURS,
    [SongCategory.HYMNS]: SongMacroCategory.HYMNS,
    [SongCategory.SIMPLE_PRAYER]: SongMacroCategory.SONGS,
    [SongCategory.MARIANS]: SongMacroCategory.SONGS,
    [SongCategory.ANIMATION]: SongMacroCategory.ANIMATION,
    [SongCategory.GREGORIANS]: SongMacroCategory.GREGORIANS,
    [SongCategory.ADVENT]: SongMacroCategory.ADVENT,
    [SongCategory.CHRISTMAS]: SongMacroCategory.CHRISTMAS,
    [SongCategory.LENT]: SongMacroCategory.LENT,
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
      const categoriesDiff = songCategoryToMacroCategoryMap[a.language]![
        a.category
      ]!.localeCompare(
        songCategoryToMacroCategoryMap[b.language]![b.category]!,
      );
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      if (categoriesDiff !== 0) {
        return categoriesDiff;
      }
    }

    return a.number - b.number;
  });

  res.json(sortedSongs);
};
