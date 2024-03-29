import type { ObjectId } from 'mongodb';

export enum MagazineType {
  ANCILLA_DOMINI = 'ancilla-domini',
  SEMPRECONNESSI = 'sempreconnessi',
}

export enum MagazineLanguage {
  ITALIAN = 'it',
  GERMAN = 'de',
}

export enum MagazineFrequency {
  BIMONTHLY = 'bimonthly',
  QUARTERLY = 'quarterly',
  SPECIAL = 'special',
}

export interface Magazine {
  type: MagazineType;
  code: string;
  language: MagazineLanguage;
  frequency: MagazineFrequency;
  name: string;
  date: Date;
}

export interface Fraternity {
  location: string;
  seats: number;
  masses: {
    sunday?: string[];
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    default?: string[];
    overrides?: Record<string, string[]>;
  };
}

export interface HolyMassParticipant {
  userId: string;
  seats: number;
  bookingId: ObjectId;
  deleted?: boolean;
}

export interface HolyMass {
  date: Date;
  fraternity: {
    id: ObjectId;
    location: string;
    seats: number;
  };
  participants: HolyMassParticipant[];
}

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

export interface LiturgyContent {
  color?: LiturgyColor;
  sections: LiturgySection[];
}

export interface Liturgy {
  date: Date;
  language: LiturgyLanguage;
  content: LiturgyContent;
  createdAt: Date;
}

export interface Prayer {
  slug: string;
  title: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  subtitle?: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  content: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  image: string;
}

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

export interface Subscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}
