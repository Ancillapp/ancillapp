import { mongoDb } from '../../../helpers/mongo';
import { Ancilla } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getAncillas: RequestHandler = async (_, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const ancillasCollection = db.collection<Ancilla>('ancillas');

  const ancillas = (await ancillasCollection
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
    .sort({ date: -1 })
    .toArray()) as Pick<Ancilla, 'code' | 'name'>[];

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
};
