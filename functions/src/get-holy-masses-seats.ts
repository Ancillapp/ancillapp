import * as functions from 'firebase-functions';
import { mongoDb, ObjectId } from './helpers/mongo';

export const getHolyMassesSeats = functions.https.onRequest(
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'private, no-cache');

    const [, fraternityId, date] = req.path.match(
      /\/api\/fraternities\/([a-z\d_-]+)\/holy-masses\/([a-z\d_-]+)\/seats/i,
    )!;

    const db = await mongoDb;
    const fraternitiesCollection = db.collection('fraternities');
    const holyMassesCollection = db.collection('holyMasses');

    const fraternity = await fraternitiesCollection.findOne({
      _id: new ObjectId(fraternityId),
    });

    if (!fraternity) {
      res.status(400).send();
      return;
    }

    const { seats } = fraternity;

    const holyMass = await holyMassesCollection.findOne({
      fraternity: new ObjectId(fraternityId),
      date: new Date(date),
    });

    const takenSeats =
      holyMass?.participants.reduce(
        (sum: number, { seats }: { seats: number }) => sum + seats,
        0,
      ) || 0;

    const availableSeats = seats - takenSeats;

    res.json(availableSeats);
  },
);
