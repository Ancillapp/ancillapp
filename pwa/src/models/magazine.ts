export enum MagazineType {
  ANCILLA_DOMINI = 'ancilla-domini',
  SEMPRECONNESSI = 'sempreconnessi',
}

export enum MagazineLanguage {
  ITALIAN = 'it',
  GERMAN = 'de',
  PORTUGUESE = 'pt',
}

export enum MagazineFrequency {
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  SPECIAL = 'special',
}

export interface Magazine {
  type: MagazineType;
  language: MagazineLanguage;
  frequency: MagazineFrequency;
  date: string;
  code: string;
  name: string;
  link: string;
  thumbnail: string;
}
