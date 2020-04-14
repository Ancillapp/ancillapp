import * as functions from 'firebase-functions';
import { mongoClient } from './helpers/mongo';

export const getAncillas = functions.https.onRequest(async (_, res) => {
  const client = await mongoClient;
  const ancillasCollection = client.db('Main').collection('ancillas');

  const ancillas = await ancillasCollection
    .find(
      {},
      {
        projection: {
          _id: 0,
          code: 1,
          name: 1,
        },
      },
    )
    .toArray();

  res.json(ancillas);
});
