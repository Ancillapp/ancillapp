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
  number: string;
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
