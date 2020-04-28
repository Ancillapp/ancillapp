import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getAncilla = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const code = req.path.match(/\/api\/ancillas\/([a-z\d_-]+)/i)?.[1];

  if (!code) {
    res.status(404).send();
    return;
  }

  const db = await mongoDb;
  const ancillasCollection = db.collection('ancillas');

  const ancilla = await ancillasCollection.findOne(
    { code },
    {
      projection: {
        _id: 0,
        name: 1,
      },
    },
  );

  res.json({
    ...ancilla,
    code,
    link: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
      code,
    )}.pdf?alt=media`,
    thumbnail: `https://firebasestorage.googleapis.com/v0/b/ancillas/o/processed%2F${encodeURIComponent(
      code,
    )}.jpg?alt=media`,
  });
});
