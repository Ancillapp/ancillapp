const { Router } = require('express');
const cors = require('cors');
const songs = require('./songs');
const ancillas = require('./ancillas');
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

module.exports = router;
