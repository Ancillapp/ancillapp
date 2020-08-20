import { mongoDb, ObjectId } from '../../../helpers/mongo';
import type { Fraternity, HolyMass } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getHolyMassesSeats: RequestHandler = async (
  { params: { fraternityId, date } },
  res,
) => {
  const db = await mongoDb;
  const holyMassesCollection = db.collection<HolyMass>('holyMasses');

  const holyMass = await holyMassesCollection.findOne({
    'fraternity.id': new ObjectId(fraternityId),
    date: new Date(date),
  });

  const takenSeats =
    holyMass?.participants.reduce(
      (sum: number, { seats, deleted }: { seats: number; deleted?: boolean }) =>
        deleted ? sum : sum + seats,
      0,
    ) || 0;

  const totalSeats =
    holyMass?.fraternity.seats ||
    (
      await db.collection<Fraternity>('fraternities').findOne({
        _id: new ObjectId(fraternityId),
      })
    )?.seats;

  if (typeof totalSeats !== 'number') {
    res.status(400).send();
    return;
  }

  const availableSeats = totalSeats - takenSeats;

  res.json(availableSeats);
};
