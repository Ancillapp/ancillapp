import { mongoDb } from '../../../helpers/mongo';
import { Song } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getSong: RequestHandler = async ({ params: { number } }, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const songsCollection = db.collection<Song>('songs');

  const song = await songsCollection.findOne(
    { number },
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
