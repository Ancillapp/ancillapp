export enum LiturgyLanguage {
  ITALIAN = 'it',
  GERMAN = 'de',
  PORTUGUESE = 'pt',
  ENGLISH = 'en',
}

export enum LiturgyColor {
  GREEN = 'green',
  VIOLET = 'violet',
  ROSE = 'rose',
  WHITE = 'white',
  RED = 'red',
  BLACK = 'black',
}

export interface LiturgySection {
  title?: string;
  subtitle?: string;
  sections?: string[] | LiturgySection[];
}

export interface GetLiturgyResult {
  color?: LiturgyColor;
  sections: LiturgySection[];
}
