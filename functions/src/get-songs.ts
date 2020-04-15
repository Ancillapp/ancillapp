import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getSongs = functions.https.onRequest(async (_, res) => {
  const db = await mongoDb;
  const songsCollection = db.collection('songs');

  const songs = await songsCollection
    .find(
      {},
      {
        projection: {
          _id: 0,
          number: 1,
          title: 1,
        },
      },
    )
    .toArray();

  res.json(songs);
});
