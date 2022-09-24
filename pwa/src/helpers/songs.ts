import {
  SongCategory,
  SongLanguage,
  SongMacroCategory,
  SongSummary,
} from '../models/song';

export const songCategoriesArray = Object.values(SongCategory);

export const songMacroCategoriesArray = Object.values(SongMacroCategory);

export const songLanguagesArray = Object.values(SongLanguage);

export const songCategoryToMacroCategoryMap: Record<
  SongCategory,
  SongMacroCategory
> = {
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
};

export const songMacroCategoryToCategoriesMap: Record<
  SongMacroCategory,
  SongCategory[]
> = Object.entries(songCategoryToMacroCategoryMap).reduce(
  (acc, [category, macroCategory]) => ({
    ...acc,
    [macroCategory]: [...(acc[macroCategory] || []), category],
  }),
  {} as Record<SongMacroCategory, SongCategory[]>,
);

export const getSongPrefix = (song: SongSummary) =>
  song.language === SongLanguage.ITALIAN
    ? songCategoryToMacroCategoryMap[song.category]
    : '';

export const getFormattedSongNumber = (song: SongSummary) =>
  `${getSongPrefix(song)}${song.number}`;
