import { mongoDb } from '../../../helpers/mongo';
import { Magazine } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export type GetMagazineParams = Pick<Magazine, 'type' | 'code'>;

export interface GetMagazineResult extends Magazine {
  link: string;
  thumbnail: string;
}

export const getMagazine: RequestHandler<
  GetMagazineParams,
  GetMagazineResult
> = async ({ params: { type, code: inputCode } }, res) => {
  res.set(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
  );

  const db = await mongoDb;
  const magazinesCollection = db.collection<Magazine>('magazines');

  const projection = {
    _id: 0,
    type: 1,
    code: 1,
    name: 1,
    date: 1,
  };

  const data =
    inputCode === 'latest'
      ? (
          await magazinesCollection
            .find({ type }, { projection })
            .sort({ date: -1 })
            .limit(1)
            .toArray()
        )[0]
      : await magazinesCollection.findOne(
          { type, code: inputCode },
          { projection },
        );

  if (!data) {
    res.status(404).send();
    return;
  }

  const { code, ...magazine } = data;

  res.json({
    ...magazine,
    code,
    link: `https://storage.googleapis.com/ffb-magazines/${type}/${encodeURIComponent(
      code,
    )}.pdf`,
    thumbnail: `https://storage.googleapis.com/ffb-magazines/${type}/${encodeURIComponent(
      code,
    )}.jpg`,
  });
};
