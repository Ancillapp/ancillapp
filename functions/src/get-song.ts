import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getSong = functions.https.onRequest(async ({ path }, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=86400',
  );

  const number = path.match(/\/api\/songs\/([a-z\d]+)/i)?.[1];

  if (!number) {
    res.status(404).send();
    return;
  }

  const db = await mongoDb;
  const songsCollection = db.collection('songs');

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
});
