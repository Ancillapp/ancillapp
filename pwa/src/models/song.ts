export interface Song {
  number: string;
  title: string;
  language: string;
  content: string;
  category: string;
}

export type SongSummary = Omit<Song, 'content'>;
