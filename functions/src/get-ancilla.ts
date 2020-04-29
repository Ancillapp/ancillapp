import * as functions from 'firebase-functions';
import { mongoDb } from './helpers/mongo';

export const getAncilla = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const inputCode = req.path.match(/\/api\/ancillas\/([a-z\d_-]+)/i)?.[1];

  if (!inputCode) {
    res.status(404).send();
    return;
  }

  const db = await mongoDb;
  const ancillasCollection = db.collection('ancillas');

  const projection = {
    _id: 0,
    code: 1,
    name: 1,
  };

  const data =
    inputCode === 'latest'
      ? (
          await ancillasCollection
            .find({}, { projection })
            .sort({ date: -1 })
            .limit(1)
            .toArray()
        )[0]
      : await ancillasCollection.findOne({ code: inputCode }, { projection });

  if (!data) {
    res.status(404).send();
    return;
  }

  const { code, ...ancilla } = data;

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
