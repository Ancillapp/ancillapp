const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const api = require('./controllers/api');
const app = express();

app.use('/api', api);
app.use(history());
app.use(express.static(path.resolve(__dirname, 'build')));

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)); // eslint-disable-line no-console
