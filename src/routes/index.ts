import { Router } from 'express';
import { ok } from '@/core/http/api-response';

/**
 * Aggregates all versioned feature routers mounted under the API prefix.
 * Register new feature modules here.
 */
export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json(ok({ name: 'BiteTrack API', version: 'v1' }));
});
