const { Router } = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const songs = require('./songs');
const ancillas = require('./ancillas');
const notifications = require('./notifications');
const router = new Router();

let whitelist = [];
if (process.env.CORS_WHITELIST) {
  try {
    whitelist = JSON.parse(process.env.CORS_WHITELIST);
  } catch (e) {
    whitelist = [process.env.CORS_WHITELIST];
  }
}

router.use(cors({
  origin: (origin, cb) => {
    if (!origin || whitelist.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
}));

router.use(bodyParser.json());

router.use((req, res, next) => {
  try {
    next();
  } catch (e) {
    res.status(500).json({
      status: 500,
      data: 'Internal Server Error',
    });
  }
});

router.use('/songs', songs);
router.use('/ancillas', ancillas);
router.use('/notifications', notifications);

// Fallback for any other API route
router.use((req, res) =>
  res.status(404).json({
    status: 404,
    data: 'Not Found',
  }));

module.exports = router;
