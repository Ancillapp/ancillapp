import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getPrayers = functions.https.onRequest(
  async ({ query: { fullData } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    const db = await mongoDb;
    const prayersCollection = db.collection('prayers');

    const prayers = await prayersCollection
      .find(
        {},
        {
          projection: {
            _id: 0,
            slug: 1,
            title: 1,
            image: 1,
            ...(typeof fullData !== 'undefined' && {
              content: 1,
            }),
          },
        },
      )
      .sort({ _id: 1 })
      .toArray();

    res.json(prayers);
  },
);
