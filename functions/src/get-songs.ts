import * as functions from 'firebase-functions';
import { mongoClient } from './helpers/mongo';

export const getSongs = functions.https.onRequest(async (_, res) => {
  const client = await mongoClient;
  const songsCollection = client.db('Main').collection('songs');

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
