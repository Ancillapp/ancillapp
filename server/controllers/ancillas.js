const { Router } = require('express');
const { OAuth2Client } = require('google-auth-library');
const mongo = require('../services/mongodb');
const bucket = require('../services/storage');
const router = new Router();

router.get('/', async (req, res) => {
  const [files] = await bucket.getFiles({
    prefix: 'ancillas',
    delimiter: 'thumbs',
  });
  res.json({
    status: 200,
    data: files.slice(1).map(({ name }) => name.slice(9, 16)),
  });
});

router.get('/:yyyymm', (req, res) => {
  bucket
    .file(`ancillas/${req.params.yyyymm}.pdf`)
    .createReadStream()
    .on('error', () => {
      res.status(404).json({
        status: 404,
        data: 'Not Found',
      });
    }).pipe(res);
});

router.post('/', async (req, res) => {
  if (
    !req.body ||
    !req.body.period) {
    res.status(400).json({
      status: 400,
      data: 'Bad Request',
    });
    return;
  }
  const db = await mongo;
  // We want to make sure we only add the necessary data to the DB
  const code = `${req.body.special ? 'S' : ''}${req.body.period}`;
  const ancilla = {
    code,
    period: req.body.period,
    ...req.body.special ? {
      special: true,
    } : {},
  };
  await Promise.all([
    db.collection('ancillas').insertOne(ancilla),
    /* notifications.sendNotification(subscription, JSON.stringify({
      title: 'Perfetto!',
      body: 'Sei stato registrato correttamente!',
    })), */
    // TODO: insert image into bucket
  ]);
  res.json({
    status: 200,
    data: 'OK',
  });
});

module.exports = router;
