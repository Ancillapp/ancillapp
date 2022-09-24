export enum PrayerLanguage {
  ITALIAN = 'it',
  LATIN = 'la',
  GERMAN = 'de',
  ENGLISH = 'en',
  PORTUGUESE = 'pt',
}

export interface Prayer {
  image: string;
  slug: string;
  title: Partial<Record<PrayerLanguage, string>>;
  content: Partial<Record<PrayerLanguage, string>>;
}

export type PrayerSummary = Omit<Prayer, 'content'>;
