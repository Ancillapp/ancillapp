import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
// import path from 'path';

import { getMagazines } from './handlers/magazines/list';
import { getMagazine } from './handlers/magazines/detail';
import { getPrayers } from './handlers/prayers/list';
import { getPrayer } from './handlers/prayers/detail';
import { getSongs } from './handlers/songs/list';
import { getSong } from './handlers/songs/detail';
import { getBreviary } from './handlers/breviary';
import { getFraternities } from './handlers/holy-mass/fraternities';
import { getLiturgy } from './handlers/holy-mass/liturgy';

const app = express();

app.use(cors());

app.get('/api/magazines', getMagazines);
app.get('/api/magazines/:type/:code', getMagazine);
app.get('/api/prayers', getPrayers);
app.get('/api/prayers/:slug', getPrayer);
app.get('/api/songs', getSongs);
app.get('/api/songs/:language/:category/:number', getSong);
app.get('/api/breviary', getBreviary);
app.get('/api/fraternities', getFraternities);
app.get('/api/holy-masses/liturgy', getLiturgy);
// app.get('*', (req, res, next) => {
//   if (req.path !== '/index.html' && req.path.includes('.')) {
//     return next();
//   }

//   res.sendFile(path.resolve(__dirname, 'index.html'));
// });

export const api = onRequest(app);
