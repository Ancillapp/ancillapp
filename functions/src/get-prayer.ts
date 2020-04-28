import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getPrayer = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const slug = req.path.match(/\/api\/prayers\/([a-z-]+)/)?.[1];

  if (!slug) {
    res.status(404).send();
    return;
  }

  const db = await mongoDb;
  const prayersCollection = db.collection('prayers');

  const prayer = await prayersCollection.findOne(
    { slug },
    {
      projection: {
        _id: 0,
      },
    },
  );

  res.json(prayer);
});
