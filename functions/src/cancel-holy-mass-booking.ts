import * as functions from 'firebase-functions';
import { mongoDb, ObjectId } from './helpers/mongo';

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
  const holyMassesCollection = db.collection('holyMasses');

  const holyMassUpdateResult = await holyMassesCollection.findOneAndUpdate(
    {
      fraternity: new ObjectId(fraternityId),
      date: new Date(date),
    },
    {
      $pull: {
        participants: {
          userId,
        },
      },
    },
    {
      returnOriginal: false,
    },
  );

  if (!holyMassUpdateResult.value) {
    res.status(404).json({ code: 'HOLY_MASS_NOT_FOUND' });
    return;
  }

  res.status(200).json({ id: holyMassUpdateResult.value._id });
};
