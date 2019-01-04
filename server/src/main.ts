import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-connect';
// import history from 'connect-history-api-fallback';
import { resolve } from 'path';
import boom from 'boom';
import { apiController } from './controllers/api.controller';
import { makeHandler as makePrplServerHandler } from 'prpl-server';
import { makeMiddleware as makeRendertronMiddleware } from 'rendertron-middleware';

const app = new Koa();
const router = new Router();

router
  .use('/api', ...apiController)
  .get('/*', convert(makePrplServerHandler(resolve(__dirname, '../build'), require('../build/polymer.json'))));

app
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      ctx.body = boom.internal();
    }
  })
  .use(convert(
    makeRendertronMiddleware({
      proxyUrl: 'https://render-tron.appspot.com/render',
      injectShadyDom: true,
    }),
  ))
  .use(router.routes())
  .use(router.allowedMethods({
    throw: true,
    notImplemented: () => boom.notImplemented(),
    methodNotAllowed: () => boom.methodNotAllowed(),
  }))
  // .use(convert(history()))
  .listen(process.env.PORT, () =>
    console.log(`Listening on port ${process.env.PORT}`));
