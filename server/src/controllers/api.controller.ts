import { Context } from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import body from 'koa-body';
import boom from 'boom';

const whitelist = `${process.env.CORS_WHITELIST}`.split(',');

const router = new Router()
  .use(cors({
    origin: (ctx: Context) => {
      const origin = ctx.get('Origin');
      if (!origin || whitelist.includes(origin)) {
        return origin;
      }
      throw boom.unauthorized('Not allowed by CORS');
    },
    allowMethods: ['GET', 'POST'],
  }))
  .use(body())
  /* .use('/songs', songs);
  .use('/ancillas', ancillas);
  .use('/notifications', notifications) */;

export const apiController = [router.routes(), router.allowedMethods()];
