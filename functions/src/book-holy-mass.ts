import * as functions from 'firebase-functions';
import { mongoDb, ObjectId } from './helpers/mongo';

export const bookHolyMass = async ({
  body,
  userId,
  fraternityId,
  date,
  res,
}: {
  body?: Record<string, any>;
  userId: string;
  fraternityId: string;
  date: string;
  res: functions.Response<any>;
}) => {
  const seats = body?.seats ?? 1;

  if (typeof seats !== 'number' || seats < 1 || seats > 5) {
    res.status(400).json({ code: 'INVALID_SEATS' });
    return;
  }

  const db = await mongoDb;
  const fraternitiesCollection = db.collection('fraternities');
  const holyMassesCollection = db.collection('holyMasses');

  const fraternity = await fraternitiesCollection.findOne({
    _id: new ObjectId(fraternityId),
  });

  if (!fraternity) {
    res.status(400).json({ code: 'FRATERNITY_NOT_FOUND' });
    return;
  }

  const { seats: totalSeats } = fraternity;

  const existingHolyMass = await holyMassesCollection.findOne({
    fraternity: new ObjectId(fraternityId),
    date: new Date(date),
  });

  // If the holy mass doesn't exist yet, create it.
  if (!existingHolyMass) {
    const { insertedId: id } = await holyMassesCollection.insertOne({
      fraternity: new ObjectId(fraternityId),
      date: new Date(date),
      participants: [{ userId, seats }],
    });

    res.status(201).send({ id });
    return;
  }

  // The user has already booked some seats for this holy mass
  if (
    existingHolyMass.participants.some(
      ({
        userId: participantId,
        deleted,
      }: {
        userId: string;
        deleted?: boolean;
      }) => userId === participantId && !deleted,
    )
  ) {
    res.status(400).json({ code: 'ALREADY_BOOKED' });
    return;
  }

  const takenSeats = existingHolyMass.participants.reduce(
    (
      sum: number,
      { seats: bookedSeats, deleted }: { seats: number; deleted?: boolean },
    ) => (deleted ? sum : sum + bookedSeats),
    0,
  );

  if (takenSeats >= totalSeats) {
    res.status(400).json({ code: 'MAX_CAPACITY_REACHED' });
    return;
  }

  const updatedHolyMass = await holyMassesCollection.findOneAndUpdate(
    {
      fraternity: new ObjectId(fraternityId),
      date: new Date(date),
      participants: {
        $not: {
          $elemMatch: {
            userId,
            deleted: {
              $ne: true,
            },
          },
        },
      },
    },
    {
      $push: {
        participants: {
          userId,
          seats,
        },
      },
    },
    { returnOriginal: false },
  );

  if (!updatedHolyMass?.value?._id) {
    res.status(400).json({ code: 'ALREADY_BOOKED' });
    return;
  }

  res.status(201).json({ id: updatedHolyMass.value._id });
};
