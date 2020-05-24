import * as functions from 'firebase-functions';
import { mongoDb, ObjectId } from './helpers/mongo';
import { HolyMass } from './models/mongo';

export const cancelHolyMassBooking = async ({
  userId,
  fraternityId,
  date,
  res,
}: {
  userId: string;
  fraternityId: string;
  date: string;
  res: functions.Response<any>;
}) => {
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
