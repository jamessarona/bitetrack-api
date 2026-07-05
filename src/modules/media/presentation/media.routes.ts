import { Router } from 'express';
import { validateBody } from '@/core/middleware/validate';
import { authenticate } from '@/modules/auth/presentation/middleware/authenticate';
import { createUploadSessionSchema } from '@/modules/business/presentation/validators/business.validator';
import { mediaController } from './media.controller';

export const mediaRouter = Router();

mediaRouter.post(
  '/upload-sessions',
  authenticate,
  validateBody(createUploadSessionSchema),
  mediaController.createUploadSession,
);
