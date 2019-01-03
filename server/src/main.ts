import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-connect';
import history from 'connect-history-api-fallback';
import koaStatic from 'koa-static';
import boom from 'boom';
import { resolve } from 'path';
import { apiController } from './controllers/api.controller';

const app = new Koa();
const router = new Router();

router.use('/api', apiController);

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
  .use(koaStatic(resolve(__dirname, 'build')))
  .listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}`));
