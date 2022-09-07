import { mongoDb } from '../../../helpers/mongo';
import { Song, SongSummary } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export interface GetSongsQueryParams {
  fullData?: string;
}

export const getSongs: RequestHandler<
  void,
  Song[] | SongSummary[],
  void,
  GetSongsQueryParams
> = async ({ query: { fullData } }, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const songsCollection = db.collection<Song>('songs');

  const songs: typeof fullData extends string ? Song[] : SongSummary[] =
    await songsCollection
      .find(
        {},
        {
          projection: {
            _id: 0,
            language: 1,
            category: 1,
            number: 1,
            title: 1,
            ...(typeof fullData !== 'undefined' && {
              content: 1,
            }),
          },
        },
      )
      .toArray();

  const sortedSongs = songs.sort(({ number: a }, { number: b }) => {
    const normalizedA = a.replace('bis', '').padStart(4, '0');
    const normalizedB = b.replace('bis', '').padStart(4, '0');

    if (normalizedA === normalizedB) {
      return b.endsWith('bis') ? -1 : 1;
    }

    return normalizedA < normalizedB ? -1 : 1;
  });

  res.json(sortedSongs);
};
