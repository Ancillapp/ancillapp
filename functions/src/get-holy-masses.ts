import * as functions from 'firebase-functions';
import { firebase } from './helpers/firebase';
import { mongoDb } from './helpers/mongo';

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
    const holyMassesCollection = db.collection('holyMasses');

    const holyMasses = await holyMassesCollection
      .aggregate([
        {
          $match: {
            participants: {
              $elemMatch: {
                userId: decodedToken.uid,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'fraternities',
            localField: 'fraternity',
            foreignField: '_id',
            as: 'fraternity',
          },
        },
        {
          $unwind: {
            path: '$fraternity',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            fraternity: {
              id: '$fraternity._id',
              location: 1,
            },
            date: 1,
            filteredParticipants: {
              $filter: {
                input: '$participants',
                as: 'participant',
                cond: {
                  $eq: ['$$participant.userId', decodedToken.uid],
                },
              },
            },
          },
        },
        {
          $project: {
            id: 1,
            fraternity: 1,
            date: 1,
            participant: {
              $arrayElemAt: ['$filteredParticipants', 0],
            },
          },
        },
        {
          $project: {
            id: 1,
            fraternity: 1,
            date: 1,
            seats: '$participant.seats',
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
