import * as functions from 'firebase-functions';
import { firebase } from './helpers/firebase';
import { mongoDb, ObjectId } from './helpers/mongo';

export const bookHolyMass = functions.https.onRequest(
  async ({ path, method, body, headers: { authorization } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Cache-Control', 'private, no-store');

    if (method === 'OPTIONS') {
      res.status(204).send();
      return;
    }

    const seats = body?.seats ?? 1;

    if (typeof seats !== 'number' || seats < 1 || seats > 5) {
      res.status(400).json({ code: 'INVALID_SEATS' });
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

    const [, fraternityId, date] = path.match(
      /\/api\/fraternities\/([a-z\d_-]+)\/holy-masses\/([a-z\d_-]+)/i,
    )!;

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
        participants: [{ userId: decodedToken.uid, seats }],
      });

      res.status(201).send({ id });
      return;
    }

    // The user has already booked some seats for this holy mass
    if (
      existingHolyMass.participants.some(
        ({ userId }: { userId: string }) => userId === decodedToken.uid,
      )
    ) {
      res.status(400).json({ code: 'ALREADY_BOOKED' });
      return;
    }

    const takenSeats = existingHolyMass.participants.reduce(
      (sum: number, { seats: bookedSeats }: { seats: number }) =>
        sum + bookedSeats,
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
              userId: decodedToken.uid,
            },
          },
        },
      },
      {
        $push: {
          participants: {
            userId: decodedToken.uid,
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
  },
);
