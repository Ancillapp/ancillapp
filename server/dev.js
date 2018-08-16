require('dotenv').config();

const express = require('express');
const webpack = require('webpack');
const history = require('connect-history-api-fallback');
const webpackConfig = require('../webpack/dev.config');
const middleware = require('webpack-dev-middleware');
const api = require('./controllers/api');
const compiler = webpack(webpackConfig);
const app = express();

app.use('/api', api);
app.use(history());
app.use(middleware(compiler));

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)); // eslint-disable-line no-console
