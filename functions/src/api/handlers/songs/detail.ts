import { mongoDb } from '../../../helpers/mongo';
import { Song } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export type GetSongParams = Pick<Song, 'language' | 'category' | 'number'>;

export const getSong: RequestHandler<GetSongParams, Song> = async (
  { params: { language, category, number } },
  res,
) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const songsCollection = db.collection<Song>('songs');

  const song = await songsCollection.findOne(
    {
      language,
      category,
      // TODO: replace this with just Number(number) when migration is completed
      number: {
        $in: [number, parseInt(number.toString(), 10)],
      },
    },
    {
      projection: {
        _id: 0,
      },
    },
  );

  if (!song) {
    res.status(404).send();
    return;
  }

  res.json(song);
};
