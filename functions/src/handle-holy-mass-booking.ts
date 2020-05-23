import * as functions from 'firebase-functions';
import { firebase } from './helpers/firebase';
import { bookHolyMass } from './book-holy-mass';
import { cancelHolyMassBooking } from './cancel-holy-mass-booking';

export const handleHolyMassBooking = functions.https.onRequest(
  async ({ path, method, body, headers: { authorization } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', '*');
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

    const [, fraternityId, date] = path.match(
      /\/api\/fraternities\/([a-z\d_-]+)\/holy-masses\/(.+)/i,
    )!;

    if (method === 'POST') {
      return bookHolyMass({
        body,
        userId: decodedToken.uid,
        fraternityId,
        date,
        res,
      });
    }

    if (method === 'DELETE') {
      return cancelHolyMassBooking({
        userId: decodedToken.uid,
        fraternityId,
        date,
        res,
      });
    }

    res.status(405).send();
  },
);
