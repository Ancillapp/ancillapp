import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getFraternities = functions.https.onRequest(async (_, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const fraternitiesCollection = db.collection('fraternities');

  const fraternities = await fraternitiesCollection
    .find(
      {},
      {
        projection: {
          _id: 1,
          location: 1,
          masses: 1,
        },
      },
    )
    .toArray();

  res.json(
    fraternities.map(({ _id: id, ...fraternity }) => ({
      id,
      ...fraternity,
    })),
  );
});
