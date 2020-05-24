import * as functions from 'firebase-functions';
import { firebase } from './helpers/firebase';
import { mongoDb } from './helpers/mongo';
import type { HolyMass } from './models/mongo';

export const getHolyMasses = functions.https.onRequest(
  async ({ method, headers: { authorization } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Cache-Control', 'private, no-store');

    if (method === 'OPTIONS') {
      res.status(204).send();
      return;
    }

    const token = authorization?.match(/Bearer (.+)/)?.[1];

    if (!token) {
      res.status(401).send();
      return;
    }

    const decodedToken = await firebase
      .auth()
      .verifyIdToken(token)
      .catch(() => null);

    if (!decodedToken) {
      res.status(403).send();
      return;
    }

    const db = await mongoDb;
    const holyMassesCollection = db.collection<HolyMass>('holyMasses');

    const holyMasses = await holyMassesCollection
      .aggregate([
        {
          $match: {
            participants: {
              $elemMatch: {
                userId: decodedToken.uid,
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
                    { $eq: ['$$participant.userId', decodedToken.uid] },
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
  },
);
