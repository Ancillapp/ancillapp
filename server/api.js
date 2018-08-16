const { Router } = require('express');
const router = Router();
const mongo = require('./services/mongodb');

router.get('/songs', async (req, res) => {
  const db = await mongo;
  const songs = await db.collection('songs').find().toArray();
  res.json(songs);
});

router.get('/songs/:id', async (req, res) => {
  const db = await mongo;
  const song = await db.collection('songs').findOne({
    number: parseInt(req.params.id, 10),
  });
  res.json(song);
});

router.get('/songs/summary', async (req, res) => {
  const db = await mongo;
  const songsSummary = await db.collection('songs').find({}, {
    projection: {
      title: true,
      category: true,
      number: true,
    },
  }).toArray();
  res.json(songsSummary);
});

module.exports = router;
