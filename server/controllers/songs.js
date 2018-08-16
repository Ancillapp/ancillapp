const { Router } = require('express');
const mongo = require('../services/mongodb');
const router = new Router();

router.get('/', async (req, res) => {
  const db = await mongo;
  const songs = await db.collection('songs').find().toArray();
  res.json(songs);
});

router.get('/:id', async (req, res) => {
  const db = await mongo;
  const song = await db.collection('songs').findOne({
    number: parseInt(req.params.id, 10),
  });
  res.json(song);
});

router.get('/summary', async (req, res) => {
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
