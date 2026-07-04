import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { config } from '@/config';
import { errorHandler } from '@/core/middleware/error-handler';
import { httpLogger } from '@/core/middleware/http-logger';
import { notFoundHandler } from '@/core/middleware/not-found';
import { apiRateLimiter } from '@/core/middleware/rate-limit';
import { healthRouter } from '@/modules/health/health.routes';
import { apiRouter } from '@/routes';

/**
 * Builds and configures the Express application (no network binding here so it
 * can be imported directly by integration tests).
 */
export function createApp(): Express {
  const app = express();

  if (config.app.trustProxy) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  // Security & performance middleware.
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origins === '*' ? true : config.cors.origins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(config.cookie.secret));
  app.use(httpLogger);

  // Health/probe endpoints live at the root (no version, no rate limit).
  app.use('/', healthRouter);

  // Versioned API surface.
  app.use(config.app.apiPrefix, apiRateLimiter, apiRouter);

  // Fallbacks.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
