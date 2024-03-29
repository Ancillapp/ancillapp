import { mongoDb, ObjectId } from '../../../helpers/mongo';
import { Fraternity, HolyMass } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const bookHolyMass: RequestHandler = async (
  { body, params: { fraternityId, date } },
  res,
) => {
  const seats = body?.seats ?? 1;

  if (typeof seats !== 'number' || seats < 1 || seats > 5) {
    res.status(400).json({ code: 'INVALID_SEATS' });
    return;
  }

  const { uid: userId } = res.locals.user;

  const db = await mongoDb;
  const holyMassesCollection = db.collection<HolyMass>('holyMasses');

  const existingHolyMass = await holyMassesCollection.findOne({
    'fraternity.id': new ObjectId(fraternityId),
    date: new Date(date),
  });

  // If the holy mass doesn't exist yet, create it.
  if (!existingHolyMass) {
    const fraternitiesCollection = db.collection<Fraternity>('fraternities');

    const fraternity = await fraternitiesCollection.findOne({
      _id: new ObjectId(fraternityId),
    });

    if (!fraternity) {
      res.status(400).json({ code: 'FRATERNITY_NOT_FOUND' });
      return;
    }

    const { seats: totalSeats, location } = fraternity;

    const bookingId = new ObjectId();

    await holyMassesCollection.insertOne({
      date: new Date(date),
      fraternity: {
        id: new ObjectId(fraternityId),
        location,
        seats: totalSeats,
      },
      participants: [{ userId, seats, bookingId }],
    });

    res.status(201).send({ id: bookingId });
    return;
  }

  // The user has already booked some seats for this holy mass
  if (
    existingHolyMass.participants.some(
      ({ userId: participantId, deleted }) =>
        userId === participantId && !deleted,
    )
  ) {
    res.status(400).json({ code: 'ALREADY_BOOKED' });
    return;
  }

  const takenSeats = existingHolyMass.participants.reduce(
    (sum: number, { seats: bookedSeats, deleted }) =>
      deleted ? sum : sum + bookedSeats,
    0,
  );

  if (takenSeats >= existingHolyMass.fraternity.seats) {
    res.status(400).json({ code: 'MAX_CAPACITY_REACHED' });
    return;
  }

  const bookingId = new ObjectId();

  const updatedHolyMass = await holyMassesCollection.findOneAndUpdate(
    {
      'fraternity.id': new ObjectId(fraternityId),
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
          bookingId,
        },
      },
    },
    { returnDocument: 'after' },
  );

  if (!updatedHolyMass?.value?._id) {
    res.status(400).json({ code: 'ALREADY_BOOKED' });
    return;
  }

  res.status(201).json({ id: bookingId });
};
