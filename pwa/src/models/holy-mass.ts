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

export interface GetLiturgyResult {
  sections: LiturgySection[];
}
