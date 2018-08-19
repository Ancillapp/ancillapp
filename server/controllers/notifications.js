const { Router } = require('express');
const mongo = require('../services/mongodb');
const notifications = require('../services/notifications');
const router = new Router();

router.post('/subscribe', async (req, res) => {
  if (
    !req.body ||
    !req.body.endpoint ||
    !req.body.keys ||
    !req.body.keys.p256dh ||
    !req.body.keys.auth ||
    !req.body.keys.p256dh) {
    res.status(400).json({
      status: 400,
      data: 'Bad Request',
    });
    return;
  }
  const db = await mongo;
  // We want to make sure we only add the necessary data to the DB
  const subscription = {
    endpoint: req.body.endpoint,
    keys: {
      auth: req.body.keys.auth,
      p256dh: req.body.keys.p256dh,
    },
  };
  await Promise.all([
    db.collection('subscriptions').insertOne(subscription),
    notifications.sendNotification(subscription, JSON.stringify({
      title: 'Perfetto!',
      body: 'Sei stato registrato correttamente!',
    })),
  ]);
  res.json({
    status: 200,
    data: 'OK',
  });
});

module.exports = router;
