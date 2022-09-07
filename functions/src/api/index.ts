import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
// import path from 'path';

import { ssr } from './middlewares/ssr';

import { getAncillas } from './handlers/ancillas/list';
import { getAncilla } from './handlers/ancillas/detail';
import { getPrayers } from './handlers/prayers/list';
import { getPrayer } from './handlers/prayers/detail';
import { getSongs } from './handlers/songs/list';
import { getSong } from './handlers/songs/detail';
import { getBreviary } from './handlers/breviary';
import { getFraternities } from './handlers/holy-mass/fraternities';
import { authorize } from './middlewares/authorize';
import { getHolyMasses } from './handlers/holy-mass/list';
import { bookHolyMass } from './handlers/holy-mass/book';
import { cancelHolyMassBooking } from './handlers/holy-mass/cancel-booking';
import { getHolyMassesSeats } from './handlers/holy-mass/seats';

const app = express();

app.use(cors());

app.use(ssr);

app.get('/api/ancillas', getAncillas);
app.get('/api/ancillas/:code', getAncilla);
app.get('/api/prayers', getPrayers);
app.get('/api/prayers/:slug', getPrayer);
app.get('/api/songs', getSongs);
app.get('/api/songs/:language/:category/:number', getSong);
app.get('/api/breviary', getBreviary);
app.get('/api/fraternities', getFraternities);
app.get('/api/holy-masses', authorize, getHolyMasses);
app.post(
  '/api/fraternities/:fraternityId/holy-masses/:date',
  authorize,
  bookHolyMass,
);
app.delete(
  '/api/fraternities/:fraternityId/holy-masses/:date',
  authorize,
  cancelHolyMassBooking,
);
app.get(
  '/api/fraternities/:fraternityId/holy-masses/:date/seats',
  getHolyMassesSeats,
);
// app.get('*', (req, res, next) => {
//   if (req.path !== '/index.html' && req.path.includes('.')) {
//     return next();
//   }

//   res.sendFile(path.resolve(__dirname, 'index.html'));
// });

export const api = functions.https.onRequest(app);
