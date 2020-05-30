import { mongoDb, ObjectId } from '../../../helpers/mongo';
import { HolyMass } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const cancelHolyMassBooking: RequestHandler = async (
  { params: { fraternityId, date } },
  res,
) => {
  const { uid: userId } = res.locals.user;

  const db = await mongoDb;
  const holyMassesCollection = db.collection<HolyMass>('holyMasses');

  const holyMassUpdateResult = await holyMassesCollection.findOneAndUpdate(
    {
      'fraternity.id': new ObjectId(fraternityId),
      date: new Date(date),
      participants: {
        $elemMatch: {
          userId,
          deleted: {
            $ne: true,
          },
        },
      },
    },
    {
      $set: {
        'participants.$.deleted': true,
      },
    },
    {
      returnOriginal: true,
    },
  );

  if (!holyMassUpdateResult.value) {
    res.status(404).json({ code: 'HOLY_MASS_NOT_FOUND' });
    return;
  }

  const { bookingId } = holyMassUpdateResult.value.participants.find(
    (participant) => userId === participant.userId && !participant.deleted,
  )!;

  res.status(200).json({ id: bookingId });
};
