import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { config } from '@/config';
import { errorHandler } from '@/core/middleware/error-handler';
import { httpLogger } from '@/core/middleware/http-logger';
import { notFoundHandler } from '@/core/middleware/not-found';
import { apiRateLimiter } from '@/core/middleware/rate-limit';
import { healthRouter } from '@/modules/health/health.routes';
import { apiRouter } from '@/routes';
import { mediaController } from '@/modules/media/presentation/media.controller';

export function createApp(): Express {
  const app = express();

  if (config.app.trustProxy) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins === '*' ? true : config.cors.origins,
      credentials: true,
    }),
  );
  app.use(compression());

  if (config.storage.driver === 'local') {
    app.put(
      `${config.app.apiPrefix}/media/dev-upload/:token`,
      express.raw({
        type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        limit: '5mb',
      }),
      mediaController.devUpload,
    );
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(config.cookie.secret));
  app.use(httpLogger);

  if (config.storage.driver === 'local') {
    app.use(
      '/uploads',
      express.static(path.join(process.cwd(), config.storage.localDir), {
        maxAge: '1d',
        index: false,
      }),
    );
  }

  app.use('/', healthRouter);

  app.use(config.app.apiPrefix, apiRateLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
