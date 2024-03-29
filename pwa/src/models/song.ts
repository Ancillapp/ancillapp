export enum SongLanguage {
  ITALIAN = 'it',
  GERMAN = 'de',
  PORTUGUESE = 'pt',
}

export enum SongMacroCategory {
  ORDINARIUM_MISSAE = 'A',
  CANONS_AND_REFRAINS = 'R',
  SONGS = 'C',
  LITURGY_OF_THE_HOURS = 'X',
  HYMNS = 'N',
  ANIMATION = 'E',
  GREGORIANS = 'O',
  ADVENT = 'F',
  CHRISTMAS = 'I',
  LENT = 'L',
}

export enum SongCategory {
  KYRIE = 'kyrie',
  GLORY = 'glory',
  HALLELUJAH = 'hallelujah',
  CREED = 'creed',
  OFFERTORY = 'offertory',
  HOLY = 'holy',
  ANAMNESIS = 'anamnesis',
  AMEN = 'amen',
  OUR_FATHER = 'our-father',
  LAMB_OF_GOD = 'lamb-of-god',
  CANONS_AND_REFRAINS = 'canons-and-refrains',
  FRANCISCANS = 'franciscans',
  PRAISE_AND_FAREWELL = 'praise-and-farewell',
  ENTRANCE = 'entrance',
  HOLY_SPIRIT = 'holy-spirit',
  WORSHIP = 'worship',
  EUCHARIST = 'eucharist',
  OTHER_SONGS = 'other-songs',
  VENI_CREATOR = 'veni-creator',
  BENEDICTUS = 'benedictus',
  MAGNIFICAT = 'magnificat',
  CANTICLES = 'canticles',
  HYMNS = 'hymns',
  SIMPLE_PRAYER = 'simple-prayer',
  MARIANS = 'marians',
  ANIMATION = 'animation',
  GREGORIANS = 'gregorians',
  ADVENT = 'advent',
  CHRISTMAS = 'christmas',
  LENT = 'lent',
}

export interface Song {
  language: SongLanguage;
  category: SongCategory;
  // TODO: replace this with just number: number when migration is completed
  number: string | number;
  title: string;
  content: string;
}

export type SongSummary = Omit<Song, 'content'>;
