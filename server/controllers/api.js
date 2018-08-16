const { Router } = require('express');
const cors = require('cors');
const songs = require('./songs');
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

router.use('/songs', songs);

module.exports = router;
