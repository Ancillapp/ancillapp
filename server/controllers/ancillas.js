const { Router } = require('express');
const mongo = require('../services/mongodb');
const bucket = require('../services/storage');
const multer = require('multer');
const notifications = require('../services/notifications');
const auth = require('../services/auth');
const router = new Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  const db = await mongo;
  const ancillas = await db.collection('ancillas').find().toArray();
  res.json({
    status: 200,
    data: ancillas,
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

router.post('/', auth(), upload.single('image'), async (req, res) => {
  if (
    !req.body ||
    !req.body.period ||
    !req.file ||
    !req.file.buffer) {
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
  // Insert the ancilla into MongoDB and save its file into the bucket
  const [subscriptions] = await Promise.all([
    db.collection('subscriptions').find().toArray(),
    db.collection('ancillas').insertOne(ancilla),
    bucket.file(`ancillas/${code}`).save(req.file.buffer),
  ]);
  // We successfully uploaded the Ancilla, so we can already give a
  // successful answer to the user.
  res.json({
    status: 200,
    data: 'OK',
  });
  // Now that we know that the file has been uploaded and the info has been
  // saved on MongoDB, we can send a notification to the subscribed users.
  // If we fail to send a notification, most probably it means that the user
  // revoked the permission, so we remove its subscription from the DB.
  // If that fails, we just ignore it, as we don't want to fail sending the
  // notifications for just one error.
  await subscriptions.map((subscription) =>
    notifications.sendNotification(subscription, JSON.stringify({
      title: 'È uscito un nuovo Ancilla Domini!',
      body: `Edizione ${ancilla.special ? 'speciale' : 'ordinaria'} del ${ancilla.period}`,
      actions: [{
        action: 'dismiss',
        title: 'Ignora',
      }, {
        action: 'latest-ancilla',
        title: 'Leggi ora',
      }],
    })).catch(() =>
      db.collection('subscriptions').findOneAndDelete(subscription))
      .catch(() => null));
});

module.exports = router;
