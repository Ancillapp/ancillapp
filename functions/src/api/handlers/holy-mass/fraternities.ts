import { mongoDb } from '../../../helpers/mongo';

import type { RequestHandler } from 'express';

export const getFraternities: RequestHandler = async (_, res) => {
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
};
