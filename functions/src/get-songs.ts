import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getSongs = functions.https.onRequest(
  async ({ query: { fullData } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=86400',
    );

    const db = await mongoDb;
    const songsCollection = db.collection('songs');

    const songs = await songsCollection
      .find(
        {},
        {
          projection: {
            _id: 0,
            number: 1,
            title: 1,
            language: 1,
            ...(typeof fullData !== 'undefined' && {
              content: 1,
            }),
          },
        },
      )
      .toArray();

    res.json(
      songs.sort(({ number: a }, { number: b }) => {
        const normalizedA = a.replace('bis', '').padStart(4, 0);
        const normalizedB = b.replace('bis', '').padStart(4, 0);

        if (normalizedA === normalizedB) {
          return b.endsWith('bis') ? -1 : 1;
        }

        return normalizedA < normalizedB ? -1 : 1;
      }),
    );
  },
);
