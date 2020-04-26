import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getAncillas = functions.https.onRequest(async (_, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const db = await mongoDb;
  const ancillasCollection = db.collection('ancillas');

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

  res.json(
    ancillas.map(({ code, ...rest }) => ({
      ...rest,
      code,
      link: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
        code,
      )}.pdf?alt=media`,
      thumbnail: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
        code,
      )}.jpg?alt=media`,
    })),
  );
});