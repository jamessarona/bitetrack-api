import { Router } from 'express';
import { ok } from '@/core/http/api-response';
import { authRouter } from '@/modules/auth/presentation/auth.routes';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json(ok({ name: 'BiteTrack API', version: 'v1' }));
});

apiRouter.use('/auth', authRouter);
