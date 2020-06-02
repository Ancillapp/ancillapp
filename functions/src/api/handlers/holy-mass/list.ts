import { mongoDb } from '../../../helpers/mongo';
import type { HolyMass } from '../../../models/mongo';

import type { RequestHandler } from 'express';

export const getHolyMasses: RequestHandler = async (_, res) => {
  const db = await mongoDb;
  const holyMassesCollection = db.collection<HolyMass>('holyMasses');

  const holyMasses = await holyMassesCollection
    .aggregate([
      {
        $match: {
          participants: {
            $elemMatch: {
              userId: res.locals.user.uid,
              deleted: {
                $ne: true,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          fraternity: 1,
          date: 1,
          filteredParticipants: {
            $filter: {
              input: '$participants',
              as: 'participant',
              cond: {
                $and: [
                  { $eq: ['$$participant.userId', res.locals.user.uid] },
                  { $ne: ['$$participant.deleted', true] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          fraternity: 1,
          date: 1,
          participant: {
            $arrayElemAt: ['$filteredParticipants', 0],
          },
        },
      },
      {
        $project: {
          id: '$participant.bookingId',
          seats: '$participant.seats',
          fraternity: 1,
          date: 1,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ])
    .toArray();

  res.json(holyMasses || []);
};
