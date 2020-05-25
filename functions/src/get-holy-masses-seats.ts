import * as functions from 'firebase-functions';
import { mongoDb, ObjectId } from './helpers/mongo';
import type { Fraternity, HolyMass } from './models/mongo';

export const getHolyMassesSeats = functions.https.onRequest(
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'private, no-cache');

    const [, fraternityId, date] = req.path.match(
      /\/api\/fraternities\/([a-z\d_-]+)\/holy-masses\/(.+)\/seats/i,
    )!;

    const db = await mongoDb;
    const fraternitiesCollection = db.collection<Fraternity>('fraternities');
    const holyMassesCollection = db.collection<HolyMass>('holyMasses');

    const fraternity = await fraternitiesCollection.findOne({
      _id: new ObjectId(fraternityId),
    });

    if (!fraternity) {
      res.status(400).send();
      return;
    }

    const { seats } = fraternity;

    const holyMass = await holyMassesCollection.findOne({
      'fraternity.id': new ObjectId(fraternityId),
      date: new Date(date),
    });

    const takenSeats =
      holyMass?.participants.reduce(
        (
          sum: number,
          { seats, deleted }: { seats: number; deleted?: boolean },
        ) => (deleted ? sum : sum + seats),
        0,
      ) || 0;

    const availableSeats = seats - takenSeats;

    res.json(availableSeats);
  },
);
