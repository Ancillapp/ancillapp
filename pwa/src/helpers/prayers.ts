import { PrayerSummary, Prayer, PrayerLanguage } from '../models/prayer';

export const getUserLanguagesPriorityArray = (userLanguage: PrayerLanguage) =>
  Object.values(PrayerLanguage).sort((a, b) => {
    // First locale should be user's locale
    if (a === userLanguage) {
      return -1;
    }
    if (b === userLanguage) {
      return 1;
    }

    // Second priority is Latin
    if (a === PrayerLanguage.LATIN) {
      return -1;
    }
    if (b === PrayerLanguage.LATIN) {
      return 1;
    }

    // Third priority is Italian, but only if user's locale is not Italian
    if (
      userLanguage !== PrayerLanguage.ITALIAN &&
      a === PrayerLanguage.ITALIAN
    ) {
      return -1;
    }
    if (
      userLanguage !== PrayerLanguage.ITALIAN &&
      b === PrayerLanguage.ITALIAN
    ) {
      return 1;
    }

    // We sort all the other languages alphabetically
    return a.localeCompare(b);
  });

export const getPrayerDisplayedTitle = (
  prayer: Pick<PrayerSummary, 'title'>,
  localesArray: PrayerLanguage[],
) => {
  for (const locale of localesArray) {
    if (prayer.title[locale]) {
      return prayer.title[locale];
    }
  }

  throw new Error('No title found for prayer');
};

export const getPrayerDisplayedContent = (
  prayer: Pick<Prayer, 'content'>,
  localesArray: PrayerLanguage[],
) => {
  for (const locale of localesArray) {
    if (prayer.content[locale]) {
      return prayer.content[locale];
    }
  }

  throw new Error('No content found for prayer');
};
