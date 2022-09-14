import { mongoDb } from '../../../helpers/mongo';
import { Magazine } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getMagazines: RequestHandler = async (_, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const magazinesCollection = db.collection<Magazine>('magazines');

  const magazines = await magazinesCollection
    .find(
      {},
      {
        projection: {
          _id: 0,
        },
      },
    )
    .sort({ date: -1 })
    .toArray();

  res.json(
    magazines.map(({ type, code, ...rest }) => ({
      ...rest,
      type,
      code,
      link: `https://storage.googleapis.com/ffb-magazines/${type}/${encodeURIComponent(
        code,
      )}.pdf`,
      thumbnail: `https://storage.googleapis.com/ffb-magazines/${type}/${encodeURIComponent(
        code,
      )}.jpg`,
    })),
  );
};
