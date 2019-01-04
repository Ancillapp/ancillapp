require('dotenv').config();

import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-connect';
import history from 'connect-history-api-fallback';
import koaWebpack from 'koa-webpack';
import boom from 'boom';
import config from '../../webpack/dev.config';
import { apiController } from './controllers/api.controller';

const app = new Koa();
const router = new Router();

router.use('/api', ...apiController);

koaWebpack({ config })
  .then(webpack =>
    app
      .use(async (ctx, next) => {
        try {
          await next();
        } catch (e) {
          ctx.body = boom.internal();
        }
      })
      .use(router.routes())
      .use(router.allowedMethods({
        throw: true,
        notImplemented: () => boom.notImplemented(),
        methodNotAllowed: () => boom.methodNotAllowed(),
      }))
      .use(convert(history()))
      .use(webpack))
  .then(app =>
    app.listen(process.env.PORT, () =>
      console.log(`Listening on port ${process.env.PORT}`)));
