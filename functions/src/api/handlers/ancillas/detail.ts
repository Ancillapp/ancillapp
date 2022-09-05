import { mongoDb } from '../../../helpers/mongo';
import { Ancilla } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getAncilla: RequestHandler = async (
  { params: { code: inputCode } },
  res,
) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const ancillasCollection = db.collection<Ancilla>('ancillas');

  const projection = {
    _id: 0,
    code: 1,
    name: 1,
  };

  const data = (
    inputCode === 'latest'
      ? (
          await ancillasCollection
            .find({}, { projection })
            .sort({ date: -1 })
            .limit(1)
            .toArray()
        )[0]
      : await ancillasCollection.findOne({ code: inputCode }, { projection })
  ) as Pick<Ancilla, 'code' | 'name'> | null;

  if (!data) {
    res.status(404).send();
    return;
  }

  const { code, ...ancilla } = data;

  res.json({
    ...ancilla,
    code,
    link: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
      code,
    )}.pdf?alt=media`,
    thumbnail: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
      code,
    )}.jpg?alt=media`,
  });
};
